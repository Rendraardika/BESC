package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv           string
	AppPort          string
	AppURL           string
	DBHost           string
	DBPort           string
	DBUser           string
	DBPassword       string
	DBName           string
	JWTSecret        string
	JWTExpires       time.Duration
	GoogleClientID   string
	SMTPHost         string
	SMTPPort         string
	SMTPUser         string
	SMTPPass         string
	MailFrom         string
	UploadDir        string
	CORSAllowOrigins string
}

func Load() (Config, error) {
	_ = godotenv.Load(".env", "backend/.env")

	expiresHours, err := strconv.Atoi(getEnv("JWT_EXPIRES_HOURS", "24"))
	if err != nil || expiresHours <= 0 {
		expiresHours = 24
	}

	cfg := Config{
		AppEnv:           strings.ToLower(getEnv("APP_ENV", "development")),
		AppPort:          getEnv("APP_PORT", "8080"),
		AppURL:           getEnv("APP_URL", "http://localhost:8080"),
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "3306"),
		DBUser:           getEnv("DB_USER", "root"),
		DBPassword:       getEnv("DB_PASSWORD", ""),
		DBName:           getEnv("DB_NAME", "competition_platform"),
		JWTSecret:        getEnv("JWT_SECRET", "change-me"),
		JWTExpires:       time.Duration(expiresHours) * time.Hour,
		GoogleClientID:   getEnv("GOOGLE_CLIENT_ID", ""),
		SMTPHost:         getEnv("SMTP_HOST", ""),
		SMTPPort:         getEnv("SMTP_PORT", "587"),
		SMTPUser:         getEnv("SMTP_USER", ""),
		SMTPPass:         getEnv("SMTP_PASS", ""),
		MailFrom:         getEnv("MAIL_FROM", ""),
		UploadDir:        getEnv("UPLOAD_DIR", "uploads"),
		CORSAllowOrigins: getEnv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"),
	}

	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) MySQLDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&multiStatements=true&charset=utf8mb4&collation=utf8mb4_unicode_ci",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func (c Config) Validate() error {
	switch c.AppEnv {
	case "development", "production":
	default:
		return fmt.Errorf("invalid APP_ENV: %s", c.AppEnv)
	}
	if hasWildcardOrigin(c.CORSAllowOrigins) {
		return fmt.Errorf("CORS_ALLOW_ORIGINS must not allow * when credentialed cookies are enabled")
	}

	if c.AppEnv != "production" {
		return nil
	}
	return validateProduction()
}

func validateProduction() error {
	required := []string{
		"DB_HOST",
		"DB_PORT",
		"DB_USER",
		"DB_PASSWORD",
		"DB_NAME",
		"JWT_SECRET",
		"CORS_ALLOW_ORIGINS",
	}

	missing := make([]string, 0)
	values := make(map[string]string, len(required))
	for _, key := range required {
		value := strings.TrimSpace(os.Getenv(key))
		if value == "" {
			missing = append(missing, key)
			continue
		}
		values[key] = value
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required production configuration: %s", strings.Join(missing, ", "))
	}

	invalid := make([]string, 0)
	if _, err := strconv.Atoi(values["DB_PORT"]); err != nil {
		invalid = append(invalid, "DB_PORT must be numeric")
	}
	if strings.EqualFold(values["DB_USER"], "root") {
		invalid = append(invalid, "DB_USER must not be root in production")
	}
	if values["DB_PASSWORD"] == "root" {
		invalid = append(invalid, "DB_PASSWORD must not use a development password in production")
	}
	if isWeakJWTSecret(values["JWT_SECRET"]) {
		invalid = append(invalid, "JWT_SECRET must be a long random value, not a default placeholder")
	}
	if hasWildcardOrigin(values["CORS_ALLOW_ORIGINS"]) {
		invalid = append(invalid, "CORS_ALLOW_ORIGINS must not allow * in production")
	}
	if len(invalid) > 0 {
		return fmt.Errorf("invalid production configuration: %s", strings.Join(invalid, "; "))
	}

	return nil
}

func isWeakJWTSecret(value string) bool {
	secret := strings.TrimSpace(value)
	if len(secret) < 32 {
		return true
	}
	weakValues := map[string]bool{
		"change-me":                         true,
		"change-me-in-production":           true,
		"development-only-secret":           true,
		"development-only-secret-change-me": true,
		"ganti-dengan-secret-lokal":         true,
		"isi-dengan-random-secret-panjang":  true,
		"replace-with-a-long-random-secret": true,
	}
	return weakValues[secret]
}

func hasWildcardOrigin(value string) bool {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return false
	}
	for _, origin := range strings.Split(trimmed, ",") {
		if strings.TrimSpace(origin) == "*" {
			return true
		}
	}
	return false
}

func getEnv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}
