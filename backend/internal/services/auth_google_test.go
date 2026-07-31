package services

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

func TestGoogleLoginInvalidCredentialDoesNotCreateUser(t *testing.T) {
	users := newGoogleAuthUserRepository()
	service := &authService{
		users: users,
		cfg:   googleAuthConfig(),
		verifyGoogleCredential: func(credential string, clientID string) (*googleTokenInfo, error) {
			return nil, utils.ErrUnauthorized
		},
	}

	_, err := service.GoogleLogin(googleLoginRequest("invalid-token"))
	if !errors.Is(err, utils.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
	if users.createCalls != 0 {
		t.Fatalf("expected no user creation, got %d", users.createCalls)
	}
}

func TestGoogleLoginExistingUserPreservesRoleAndProfile(t *testing.T) {
	users := newGoogleAuthUserRepository()
	existing := &entities.User{
		ID:              "existing-user",
		Name:            "Existing Name",
		Email:           "user@example.com",
		Password:        "hashed-password",
		Role:            entities.RoleAdmin,
		Phone:           "08123456789",
		Institution:     "Existing School",
		Photo:           "existing-photo",
		ProfileComplete: true,
	}
	users.byEmail[existing.Email] = existing
	service := &authService{
		users: users,
		cfg:   googleAuthConfig(),
		verifyGoogleCredential: func(credential string, clientID string) (*googleTokenInfo, error) {
			return verifiedGoogleProfile("client-id", "user@example.com"), nil
		},
	}

	auth, err := service.GoogleLogin(googleLoginRequest("valid-token"))
	if err != nil {
		t.Fatalf("expected login to succeed, got %v", err)
	}
	user := auth.User.(*entities.User)
	if user.Role != entities.RoleAdmin {
		t.Fatalf("expected existing role to be preserved, got %s", user.Role)
	}
	if user.Phone != existing.Phone || user.Institution != existing.Institution || user.Photo != existing.Photo {
		t.Fatalf("expected existing profile to be preserved, got %+v", user)
	}
	if users.createCalls != 0 {
		t.Fatalf("expected no duplicate user creation, got %d", users.createCalls)
	}
	if auth.Token == "" {
		t.Fatal("expected BESC JWT to be issued")
	}
}

func TestGoogleLoginNewUserCreatesNormalUser(t *testing.T) {
	users := newGoogleAuthUserRepository()
	service := &authService{
		users: users,
		cfg:   googleAuthConfig(),
		verifyGoogleCredential: func(credential string, clientID string) (*googleTokenInfo, error) {
			return verifiedGoogleProfile("client-id", "new@example.com"), nil
		},
	}

	auth, err := service.GoogleLogin(googleLoginRequest("valid-token"))
	if err != nil {
		t.Fatalf("expected login to succeed, got %v", err)
	}
	user := auth.User.(*entities.User)
	if user.Role != entities.RoleUser {
		t.Fatalf("expected new Google user to be normal user, got %s", user.Role)
	}
	if user.ProfileComplete {
		t.Fatal("expected Google-created user to remain profile incomplete")
	}
	if users.createCalls != 1 {
		t.Fatalf("expected exactly one user creation, got %d", users.createCalls)
	}
	if auth.Token == "" {
		t.Fatal("expected BESC JWT to be issued")
	}
}

func TestGoogleLoginWrongAudienceDoesNotCreateUser(t *testing.T) {
	users := newGoogleAuthUserRepository()
	withGoogleTokenInfoServer(t, http.StatusOK, `{
		"aud":"other-client",
		"email":"user@example.com",
		"email_verified":"true",
		"exp":"`+futureUnix()+`",
		"iss":"https://accounts.google.com",
		"name":"Google User",
		"sub":"google-subject"
	}`, 5*time.Second)
	service := &authService{
		users:                  users,
		cfg:                    googleAuthConfig(),
		verifyGoogleCredential: verifyGoogleCredential,
	}

	_, err := service.GoogleLogin(googleLoginRequest("wrong-audience-token"))
	if !errors.Is(err, utils.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
	if users.createCalls != 0 {
		t.Fatalf("expected no user creation, got %d", users.createCalls)
	}
}

func TestVerifyGoogleCredentialRejectsUnverifiedEmail(t *testing.T) {
	withGoogleTokenInfoServer(t, http.StatusOK, `{
		"aud":"client-id",
		"email":"user@example.com",
		"email_verified":false,
		"exp":"`+futureUnix()+`",
		"iss":"accounts.google.com",
		"name":"Google User",
		"sub":"google-subject"
	}`, 5*time.Second)

	_, err := verifyGoogleCredential("unverified-token", "client-id")
	if !errors.Is(err, utils.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func TestVerifyGoogleCredentialRejectsExpiredToken(t *testing.T) {
	withGoogleTokenInfoServer(t, http.StatusOK, `{
		"aud":"client-id",
		"email":"user@example.com",
		"email_verified":"true",
		"exp":"1",
		"iss":"https://accounts.google.com",
		"name":"Google User",
		"sub":"google-subject"
	}`, 5*time.Second)

	_, err := verifyGoogleCredential("expired-token", "client-id")
	if !errors.Is(err, utils.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func TestVerifyGoogleCredentialTimeoutReturnsExternalService(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(50 * time.Millisecond)
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()
	restoreGoogleVerifierGlobals(t, server.URL, 5*time.Millisecond)

	_, err := verifyGoogleCredential("slow-token", "client-id")
	if !errors.Is(err, utils.ErrExternalService) {
		t.Fatalf("expected ErrExternalService, got %v", err)
	}
}

func googleLoginRequest(credential string) dto.GoogleLoginRequest {
	return dto.GoogleLoginRequest{Credential: credential}
}

func googleAuthConfig() config.Config {
	return config.Config{
		GoogleClientID: "client-id",
		JWTSecret:      "test-secret",
		JWTExpires:     time.Hour,
	}
}

func verifiedGoogleProfile(clientID, email string) *googleTokenInfo {
	return &googleTokenInfo{
		Audience:      clientID,
		Email:         email,
		EmailVerified: true,
		Expiration:    futureUnix(),
		Issuer:        "https://accounts.google.com",
		Name:          "Google User",
		Subject:       "google-subject",
	}
}

func futureUnix() string {
	return fmt.Sprintf("%d", time.Now().Add(time.Hour).Unix())
}

func withGoogleTokenInfoServer(t *testing.T, status int, body string, timeout time.Duration) {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("id_token") == "" {
			t.Error("expected id_token query parameter")
		}
		w.WriteHeader(status)
		_, _ = w.Write([]byte(body))
	}))
	t.Cleanup(server.Close)
	restoreGoogleVerifierGlobals(t, server.URL, timeout)
}

func restoreGoogleVerifierGlobals(t *testing.T, endpoint string, timeout time.Duration) {
	t.Helper()
	previousEndpoint := googleTokenInfoEndpoint
	previousClient := googleHTTPClient
	googleTokenInfoEndpoint = endpoint
	googleHTTPClient = &http.Client{Timeout: timeout}
	t.Cleanup(func() {
		googleTokenInfoEndpoint = previousEndpoint
		googleHTTPClient = previousClient
	})
}

type googleAuthUserRepository struct {
	byEmail     map[string]*entities.User
	createCalls int
}

func newGoogleAuthUserRepository() *googleAuthUserRepository {
	return &googleAuthUserRepository{byEmail: map[string]*entities.User{}}
}

func (r *googleAuthUserRepository) Create(user *entities.User) error {
	r.createCalls++
	if _, exists := r.byEmail[user.Email]; exists {
		return errors.New("Duplicate entry")
	}
	clone := *user
	r.byEmail[user.Email] = &clone
	return nil
}

func (r *googleAuthUserRepository) FindByID(id string) (*entities.User, error) {
	for _, user := range r.byEmail {
		if user.ID == id {
			clone := *user
			return &clone, nil
		}
	}
	return nil, utils.ErrNotFound
}

func (r *googleAuthUserRepository) FindByEmail(email string) (*entities.User, error) {
	user, ok := r.byEmail[email]
	if !ok {
		return nil, utils.ErrNotFound
	}
	clone := *user
	return &clone, nil
}

func (r *googleAuthUserRepository) UpdateProfile(id, name, phone, institution string) error {
	return nil
}

func (r *googleAuthUserRepository) UpdateFullProfile(user *entities.User) error {
	return nil
}

func (r *googleAuthUserRepository) Delete(id string) error {
	return nil
}
