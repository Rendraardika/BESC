package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

func TestJWTAcceptsHttpOnlySessionCookie(t *testing.T) {
	secret := "test-secret"
	token, err := utils.GenerateToken("user-1", entities.RoleUser, secret, time.Hour)
	if err != nil {
		t.Fatalf("generate token failed: %v", err)
	}
	app := fiber.New()
	app.Get("/protected", JWT(secret), func(c *fiber.Ctx) error {
		if c.Locals("user_id") != "user-1" {
			t.Fatalf("expected user_id from token, got %v", c.Locals("user_id"))
		}
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(fiber.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{Name: utils.AuthCookieName, Value: token})

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestJWTRejectsUnauthenticatedRequest(t *testing.T) {
	app := fiber.New()
	app.Get("/protected", JWT("test-secret"), func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	resp, err := app.Test(httptest.NewRequest(fiber.MethodGet, "/protected", nil))
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

func TestAdminMiddlewareUsesJWTClaimsRole(t *testing.T) {
	secret := "test-secret"
	userToken, err := utils.GenerateToken("user-1", entities.RoleUser, secret, time.Hour)
	if err != nil {
		t.Fatalf("generate user token failed: %v", err)
	}
	adminToken, err := utils.GenerateToken("admin-1", entities.RoleAdmin, secret, time.Hour)
	if err != nil {
		t.Fatalf("generate admin token failed: %v", err)
	}
	app := fiber.New()
	app.Get("/admin", JWT(secret), Admin, func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	req := httptest.NewRequest(fiber.MethodGet, "/admin", nil)
	req.AddCookie(&http.Cookie{Name: utils.AuthCookieName, Value: userToken})
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("user request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected user 403, got %d", resp.StatusCode)
	}

	req = httptest.NewRequest(fiber.MethodGet, "/admin", nil)
	req.AddCookie(&http.Cookie{Name: utils.AuthCookieName, Value: adminToken})
	resp, err = app.Test(req)
	if err != nil {
		t.Fatalf("admin request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected admin 200, got %d", resp.StatusCode)
	}
}
