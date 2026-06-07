package config

import (
	"fmt"
	"os"
	"strconv"
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

func Load() Config {
	_ = godotenv.Load()

	expiresHours, err := strconv.Atoi(getEnv("JWT_EXPIRES_HOURS", "24"))
	if err != nil || expiresHours <= 0 {
		expiresHours = 24
	}

	return Config{
		AppEnv:           getEnv("APP_ENV", "development"),
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
		CORSAllowOrigins: getEnv("CORS_ALLOW_ORIGINS", "*"),
	}
}

func (c Config) MySQLDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&multiStatements=true&charset=utf8mb4&collation=utf8mb4_unicode_ci",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
