package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
)

func TestLoginSetsHttpOnlyCookieAndDoesNotExposeToken(t *testing.T) {
	service := &authServiceFake{auth: authResponse(entities.RoleUser)}
	app := authTestApp(service, config.Config{AppEnv: "development", JWTExpires: time.Hour})

	resp, body := authRequest(t, app, "/auth/login", `{"email":"user@example.com","password":"password"}`)
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	cookie := resp.Header.Get("Set-Cookie")
	if !strings.Contains(cookie, "besc_session=session-token") {
		t.Fatalf("expected session cookie, got %q", cookie)
	}
	if !strings.Contains(cookie, "HttpOnly") {
		t.Fatalf("expected HttpOnly cookie, got %q", cookie)
	}
	if !strings.Contains(cookie, "SameSite=Lax") {
		t.Fatalf("expected SameSite=Lax cookie, got %q", cookie)
	}
	if strings.Contains(cookie, "Secure") {
		t.Fatalf("development cookie must not require Secure, got %q", cookie)
	}
	if strings.Contains(body, "session-token") || strings.Contains(body, `"token"`) {
		t.Fatalf("response body must not expose JWT, got %s", body)
	}
}

func TestGoogleLoginSetsHttpOnlyCookie(t *testing.T) {
	service := &authServiceFake{auth: authResponse(entities.RoleUser)}
	app := authTestApp(service, config.Config{AppEnv: "development", JWTExpires: time.Hour})

	resp, _ := authRequest(t, app, "/auth/google", `{"credential":"google-credential"}`)
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if cookie := resp.Header.Get("Set-Cookie"); !strings.Contains(cookie, "HttpOnly") || !strings.Contains(cookie, "besc_session=session-token") {
		t.Fatalf("expected Google login to set HttpOnly session cookie, got %q", cookie)
	}
}

func TestAdminLoginUsesSameCookieAndPreservesRoleInUserPayload(t *testing.T) {
	service := &authServiceFake{auth: authResponse(entities.RoleAdmin)}
	app := authTestApp(service, config.Config{AppEnv: "development", JWTExpires: time.Hour})

	resp, body := authRequest(t, app, "/auth/login", `{"email":"admin@example.com","password":"password"}`)
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if cookie := resp.Header.Get("Set-Cookie"); !strings.Contains(cookie, "besc_session=session-token") {
		t.Fatalf("expected admin session cookie, got %q", cookie)
	}
	if !strings.Contains(body, `"role":"admin"`) {
		t.Fatalf("expected admin role to remain in user payload, got %s", body)
	}
}

func TestProductionLoginCookieIsSecure(t *testing.T) {
	service := &authServiceFake{auth: authResponse(entities.RoleUser)}
	app := authTestApp(service, config.Config{AppEnv: "production", JWTExpires: time.Hour})

	req := httptest.NewRequest(fiber.MethodPost, "/auth/login", bytes.NewBufferString(`{"email":"user@example.com","password":"password"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Forwarded-Proto", "https")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if cookie := resp.Header.Get("Set-Cookie"); !strings.Contains(strings.ToLower(cookie), "secure") {
		t.Fatalf("expected Secure cookie in production, got %q", cookie)
	}
}

func TestLogoutExpiresSessionCookie(t *testing.T) {
	service := &authServiceFake{}
	app := authTestApp(service, config.Config{AppEnv: "development", JWTExpires: time.Hour})

	req := httptest.NewRequest(fiber.MethodPost, "/auth/logout", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	cookie := resp.Header.Get("Set-Cookie")
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if !strings.Contains(cookie, "besc_session=") || !strings.Contains(cookie, "Thu, 01 Jan 1970") {
		t.Fatalf("expected expired session cookie, got %q", cookie)
	}
}

func authTestApp(service *authServiceFake, cfg config.Config) *fiber.App {
	handler := NewAuthHandler(service, cfg)
	app := fiber.New()
	app.Post("/auth/login", handler.Login)
	app.Post("/auth/google", handler.GoogleLogin)
	app.Post("/auth/logout", handler.Logout)
	return app
}

func authRequest(t *testing.T, app *fiber.App, path, payload string) (*http.Response, string) {
	t.Helper()
	req := httptest.NewRequest(fiber.MethodPost, path, bytes.NewBufferString(payload))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	body := new(bytes.Buffer)
	if _, err := body.ReadFrom(resp.Body); err != nil {
		t.Fatalf("read response failed: %v", err)
	}
	return resp, body.String()
}

func authResponse(role string) *dto.AuthResponse {
	return &dto.AuthResponse{
		Token: "session-token",
		User: &entities.User{
			ID:    "user-1",
			Name:  "User One",
			Email: "user@example.com",
			Role:  role,
		},
	}
}

type authServiceFake struct {
	auth *dto.AuthResponse
}

func (s *authServiceFake) Register(input dto.RegisterRequest) (*dto.AuthResponse, error) {
	return s.auth, nil
}

func (s *authServiceFake) Login(input dto.LoginRequest) (*dto.AuthResponse, error) {
	return s.auth, nil
}

func (s *authServiceFake) GoogleLogin(input dto.GoogleLoginRequest) (*dto.AuthResponse, error) {
	return s.auth, nil
}

func (s *authServiceFake) CurrentUser(userID string) (*entities.User, error) {
	return nil, nil
}

func (s *authServiceFake) UpdateProfile(userID string, input dto.UpdateProfileRequest) (*entities.User, error) {
	return nil, nil
}

func (s *authServiceFake) ForgotPassword(email string) error {
	return nil
}

func (s *authServiceFake) ResetPassword(token, password string) error {
	return nil
}
