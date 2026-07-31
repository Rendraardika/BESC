package config

import (
	"strings"
	"testing"
)

func TestLoadRejectsProductionMissingJWTSecret(t *testing.T) {
	setValidProductionEnv(t)
	t.Setenv("JWT_SECRET", "")

	_, err := Load()
	if err == nil || !strings.Contains(err.Error(), "JWT_SECRET") {
		t.Fatalf("expected missing JWT_SECRET error, got %v", err)
	}
}

func TestLoadRejectsProductionMissingCORS(t *testing.T) {
	setValidProductionEnv(t)
	t.Setenv("CORS_ALLOW_ORIGINS", "")

	_, err := Load()
	if err == nil || !strings.Contains(err.Error(), "CORS_ALLOW_ORIGINS") {
		t.Fatalf("expected missing CORS_ALLOW_ORIGINS error, got %v", err)
	}
}

func TestLoadAcceptsValidProductionConfig(t *testing.T) {
	setValidProductionEnv(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected valid production config, got %v", err)
	}
	if cfg.AppEnv != "production" {
		t.Fatalf("expected production env, got %s", cfg.AppEnv)
	}
}

func TestLoadRejectsWildcardCORSWhenCookiesUseCredentials(t *testing.T) {
	t.Setenv("APP_ENV", "development")
	t.Setenv("CORS_ALLOW_ORIGINS", "*")

	_, err := Load()
	if err == nil || !strings.Contains(err.Error(), "CORS_ALLOW_ORIGINS") {
		t.Fatalf("expected wildcard CORS error, got %v", err)
	}
}

func setValidProductionEnv(t *testing.T) {
	t.Helper()

	t.Setenv("APP_ENV", "production")
	t.Setenv("APP_PORT", "8080")
	t.Setenv("APP_URL", "https://api.example.com")
	t.Setenv("DB_HOST", "localhost")
	t.Setenv("DB_PORT", "3306")
	t.Setenv("DB_USER", "besc_user")
	t.Setenv("DB_PASSWORD", "dummy-database-password")
	t.Setenv("DB_NAME", "competition_platform")
	t.Setenv("JWT_SECRET", "dummy-production-secret-at-least-32-chars")
	t.Setenv("JWT_EXPIRES_HOURS", "24")
	t.Setenv("CORS_ALLOW_ORIGINS", "https://example.com,https://www.example.com")
	t.Setenv("UPLOAD_DIR", "uploads")
	t.Setenv("GOOGLE_CLIENT_ID", "")
	t.Setenv("SMTP_HOST", "")
	t.Setenv("SMTP_PORT", "587")
	t.Setenv("SMTP_USER", "")
	t.Setenv("SMTP_PASS", "")
	t.Setenv("MAIL_FROM", "")
}
