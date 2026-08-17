package main

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env", "backend/.env", "../backend/.env")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		getEnv("DB_USER", "root"),
		getEnv("DB_PASSWORD", ""),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "3306"),
		getEnv("DB_NAME", "competition_platform"),
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("db open failed: %v", err)
	}
	defer db.Close()

	avatarDir := filepath.Join("uploads", "public", "avatars")
	if err := os.MkdirAll(avatarDir, 0755); err != nil {
		log.Fatalf("failed to create avatar dir: %v", err)
	}

	rows, err := db.Query("SELECT id, photo FROM users WHERE photo LIKE 'data:image%'")
	if err != nil {
		log.Fatalf("query failed: %v", err)
	}
	defer rows.Close()

	type userPhoto struct {
		id    string
		photo string
	}
	var users []userPhoto

	for rows.Next() {
		var u userPhoto
		if err := rows.Scan(&u.id, &u.photo); err == nil {
			users = append(users, u)
		}
	}

	fmt.Printf("Found %d users with base64 photo. Migrating to disk...\n", len(users))

	migrated := 0
	for _, u := range users {
		parts := strings.SplitN(u.photo, ",", 2)
		if len(parts) != 2 {
			continue
		}

		header := parts[0]
		data := parts[1]

		ext := ".jpg"
		if strings.Contains(header, "image/png") {
			ext = ".png"
		} else if strings.Contains(header, "image/webp") {
			ext = ".webp"
		}

		decoded, err := base64.StdEncoding.DecodeString(data)
		if err != nil {
			log.Printf("failed to decode photo for user %s: %v", u.id, err)
			continue
		}

		filename := fmt.Sprintf("user_%s%s", u.id, ext)
		filePath := filepath.Join(avatarDir, filename)

		if err := os.WriteFile(filePath, decoded, 0644); err != nil {
			log.Printf("failed to write file %s: %v", filePath, err)
			continue
		}

		relPath := fmt.Sprintf("public/avatars/%s", filename)
		_, err = db.Exec("UPDATE users SET photo = ? WHERE id = ?", relPath, u.id)
		if err != nil {
			log.Printf("failed to update db for user %s: %v", u.id, err)
			continue
		}

		migrated++
	}

	fmt.Printf("Successfully migrated %d/%d photos to %s!\n", migrated, len(users), avatarDir)
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
