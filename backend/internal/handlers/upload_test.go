package handlers

import (
	"bytes"
	"errors"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/config"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/middleware"
	"online-competition-platform/internal/utils"
)

func TestValidateSensitiveImageUpload(t *testing.T) {
	tests := []struct {
		name      string
		filename  string
		content   []byte
		wantExt   string
		wantError string
	}{
		{
			name:     "valid jpeg",
			filename: "proof.jpg",
			content:  []byte{0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00},
			wantExt:  ".jpg",
		},
		{
			name:     "valid png",
			filename: "proof.png",
			content:  []byte{0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a},
			wantExt:  ".png",
		},
		{
			name:      "fake jpeg",
			filename:  "proof.jpg",
			content:   []byte("MZ executable content"),
			wantError: "file content does not match allowed image type",
		},
		{
			name:      "unsupported extension",
			filename:  "proof.gif",
			content:   []byte{0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a},
			wantError: "file must be jpg, jpeg, png, or webp",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			header := multipartFileHeader(t, "proof", tt.filename, tt.content)

			ext, err := validateSensitiveImageUpload(header)
			if tt.wantError == "" {
				if err != nil {
					t.Fatalf("expected valid upload, got %v", err)
				}
				if ext != tt.wantExt {
					t.Fatalf("expected extension %s, got %s", tt.wantExt, ext)
				}
				return
			}
			if err == nil || !strings.Contains(err.Error(), tt.wantError) {
				t.Fatalf("expected error containing %q, got %v", tt.wantError, err)
			}
		})
	}
}

func TestValidateSensitiveImageUploadRejectsOversizedFile(t *testing.T) {
	header := multipartFileHeader(t, "proof", "proof.jpg", bytes.Repeat([]byte("x"), int(maxSensitiveImageUploadSize)+1))

	ext, validationErr := validateSensitiveImageUpload(header)
	err := assertUploadValidationError(ext, validationErr, fiber.StatusRequestEntityTooLarge)
	if err != nil {
		t.Fatal(err)
	}
}

func TestPrivateFileAccessRequiresAdmin(t *testing.T) {
	uploadDir := t.TempDir()
	privateFile := filepath.Join(uploadDir, "private", "payments", "proof.jpg")
	if err := os.MkdirAll(filepath.Dir(privateFile), 0755); err != nil {
		t.Fatalf("create private dir failed: %v", err)
	}
	if err := os.WriteFile(privateFile, []byte{0xff, 0xd8, 0xff, 0xdb}, 0644); err != nil {
		t.Fatalf("write private file failed: %v", err)
	}

	secret := "test-secret"
	cfg := config.Config{UploadDir: uploadDir}
	app := fiber.New()
	app.Get("/private-proof", middleware.JWT(secret), middleware.Admin, func(c *fiber.Ctx) error {
		return servePrivateFile(c, cfg, privateFile)
	})

	resp, err := app.Test(httptest.NewRequest(fiber.MethodGet, "/private-proof", nil))
	if err != nil {
		t.Fatalf("anonymous request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Fatalf("expected anonymous 401, got %d", resp.StatusCode)
	}
	_ = resp.Body.Close()

	userToken := mustToken(t, entities.RoleUser, secret)
	req := httptest.NewRequest(fiber.MethodGet, "/private-proof", nil)
	req.Header.Set("Authorization", "Bearer "+userToken)
	resp, err = app.Test(req)
	if err != nil {
		t.Fatalf("user request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected user 403, got %d", resp.StatusCode)
	}
	_ = resp.Body.Close()

	adminToken := mustToken(t, entities.RoleAdmin, secret)
	req = httptest.NewRequest(fiber.MethodGet, "/private-proof", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	resp, err = app.Test(req)
	if err != nil {
		t.Fatalf("admin request failed: %v", err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected admin 200, got %d", resp.StatusCode)
	}
	if _, err := io.ReadAll(resp.Body); err != nil {
		t.Fatalf("read admin response failed: %v", err)
	}
	_ = resp.Body.Close()
}

func TestStorageKeysStayPortableWithCustomUploadDir(t *testing.T) {
	uploadDir := filepath.Join(t.TempDir(), "persistent-uploads")
	cfg := config.Config{UploadDir: uploadDir}

	paymentKey := privateUploadKey("payments", "payment_test.jpg")
	paymentPath := uploadDiskPath(cfg, paymentKey)
	if paymentKey != "private/payments/payment_test.jpg" {
		t.Fatalf("expected portable payment key, got %s", paymentKey)
	}
	if !isPathInside(uploadDir, paymentPath) {
		t.Fatalf("expected payment path inside custom upload dir, got %s", paymentPath)
	}

	proctoringKey := privateUploadKey("proctoring", "submission-id", "snapshot_test.png")
	proctoringPath := uploadDiskPath(cfg, proctoringKey)
	if proctoringKey != "private/proctoring/submission-id/snapshot_test.png" {
		t.Fatalf("expected portable proctoring key, got %s", proctoringKey)
	}
	if !isPathInside(uploadDir, proctoringPath) {
		t.Fatalf("expected proctoring path inside custom upload dir, got %s", proctoringPath)
	}

	publicDir := filepath.Join(uploadDir, "public")
	if isPathInside(publicDir, paymentPath) || isPathInside(publicDir, proctoringPath) {
		t.Fatalf("private upload path must not be inside public directory")
	}
}

func TestResolveUploadPathSupportsPortableAndLegacyPaths(t *testing.T) {
	uploadDir := filepath.Join(t.TempDir(), "uploads")

	portablePath, err := resolveUploadPath(uploadDir, "private/payments/payment_test.jpg")
	if err != nil {
		t.Fatalf("resolve portable path failed: %v", err)
	}
	if !isPathInside(uploadDir, portablePath) {
		t.Fatalf("expected portable path inside upload dir, got %s", portablePath)
	}

	legacyPath, err := resolveUploadPath(uploadDir, "uploads/private/payments/payment_test.jpg")
	if err != nil {
		t.Fatalf("resolve legacy path failed: %v", err)
	}
	if !isPathInside(uploadDir, legacyPath) {
		t.Fatalf("expected legacy path inside upload dir, got %s", legacyPath)
	}
	if filepath.Clean(portablePath) != filepath.Clean(legacyPath) {
		t.Fatalf("expected legacy and portable paths to resolve to same file: %s != %s", legacyPath, portablePath)
	}
}

func multipartFileHeader(t *testing.T, field, filename string, content []byte) *multipart.FileHeader {
	t.Helper()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile(field, filename)
	if err != nil {
		t.Fatalf("create form file failed: %v", err)
	}
	if _, err := part.Write(content); err != nil {
		t.Fatalf("write form file failed: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart writer failed: %v", err)
	}

	req := httptest.NewRequest(fiber.MethodPost, "/", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if err := req.ParseMultipartForm(maxSensitiveImageUploadSize + 1024); err != nil && err != io.EOF {
		t.Fatalf("parse multipart form failed: %v", err)
	}
	return req.MultipartForm.File[field][0]
}

func assertUploadValidationError(_ string, err error, status int) error {
	var validationErr uploadValidationError
	if err == nil {
		return fiber.NewError(fiber.StatusInternalServerError, "expected upload validation error")
	}
	if !strings.Contains(err.Error(), "file size exceeds maximum allowed size") {
		return fiber.NewError(fiber.StatusInternalServerError, "unexpected upload validation message")
	}
	if !errors.As(err, &validationErr) || validationErr.status != status {
		return fiber.NewError(fiber.StatusInternalServerError, "unexpected upload validation status")
	}
	return nil
}

func mustToken(t *testing.T, role, secret string) string {
	t.Helper()
	token, err := utils.GenerateToken("user-id", role, secret, time.Hour)
	if err != nil {
		t.Fatalf("generate token failed: %v", err)
	}
	return token
}
