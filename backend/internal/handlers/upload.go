package handlers

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/config"
	"online-competition-platform/internal/utils"
	"online-competition-platform/pkg/response"
)

const maxSensitiveImageUploadSize int64 = 5 * 1024 * 1024

var allowedImageMIMEs = map[string]string{
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".png":  "image/png",
	".webp": "image/webp",
}

type uploadValidationError struct {
	status  int
	message string
}

func (e uploadValidationError) Error() string {
	return e.message
}

func validateSensitiveImageUpload(file *multipart.FileHeader) (string, error) {
	if file == nil {
		return "", uploadValidationError{status: fiber.StatusBadRequest, message: "image file is required"}
	}
	if file.Size <= 0 {
		return "", uploadValidationError{status: fiber.StatusBadRequest, message: "image file is empty"}
	}
	if file.Size > maxSensitiveImageUploadSize {
		return "", uploadValidationError{status: fiber.StatusRequestEntityTooLarge, message: "file size exceeds maximum allowed size"}
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	expectedMIME, ok := allowedImageMIMEs[ext]
	if !ok {
		return "", uploadValidationError{status: fiber.StatusBadRequest, message: "file must be jpg, jpeg, png, or webp"}
	}

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	buffer := make([]byte, 512)
	n, err := src.Read(buffer)
	if err != nil && !errors.Is(err, io.EOF) {
		return "", err
	}
	detectedMIME := http.DetectContentType(buffer[:n])
	if detectedMIME != expectedMIME {
		return "", uploadValidationError{status: fiber.StatusBadRequest, message: "file content does not match allowed image type"}
	}

	return ext, nil
}

func uploadValidationResponse(c *fiber.Ctx, err error) error {
	var validationErr uploadValidationError
	if errors.As(err, &validationErr) {
		return response.Error(c, validationErr.status, validationErr.message, nil)
	}
	return handleError(c, err)
}

func privateUploadKey(parts ...string) string {
	allParts := append([]string{"private"}, parts...)
	return filepath.ToSlash(filepath.Join(allParts...))
}

func uploadDiskPath(cfg config.Config, storageKey string) string {
	return filepath.Join(cfg.UploadDir, filepath.FromSlash(storageKey))
}

func servePrivateFile(c *fiber.Ctx, cfg config.Config, storedPath string) error {
	path, err := resolveUploadPath(cfg.UploadDir, storedPath)
	if err != nil {
		return handleError(c, err)
	}
	if _, err := os.Stat(path); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return handleError(c, utils.ErrNotFound)
		}
		return handleError(c, err)
	}
	content, err := os.ReadFile(path)
	if err != nil {
		return handleError(c, err)
	}
	c.Type(strings.TrimPrefix(filepath.Ext(path), "."))
	return c.Send(content)
}

func resolveUploadPath(uploadDir, storedPath string) (string, error) {
	if strings.TrimSpace(storedPath) == "" {
		return "", utils.ErrNotFound
	}

	cleanUploadDir := filepath.Clean(uploadDir)
	cleanStoredPath := filepath.Clean(filepath.FromSlash(strings.ReplaceAll(storedPath, "\\", "/")))
	candidate := cleanStoredPath
	if !filepath.IsAbs(candidate) {
		if isPathInside(cleanUploadDir, candidate) {
			candidate = cleanStoredPath
		} else if stripped, ok := stripUploadDirPrefix(cleanUploadDir, cleanStoredPath); ok {
			candidate = filepath.Join(cleanUploadDir, stripped)
		} else {
			candidate = filepath.Join(cleanUploadDir, candidate)
		}
	}

	uploadAbs, err := filepath.Abs(cleanUploadDir)
	if err != nil {
		return "", err
	}
	candidateAbs, err := filepath.Abs(candidate)
	if err != nil {
		return "", err
	}
	if !isPathInside(uploadAbs, candidateAbs) {
		return "", utils.ErrForbidden
	}
	return candidateAbs, nil
}

func stripUploadDirPrefix(uploadDir, storedPath string) (string, bool) {
	uploadBase := filepath.Base(uploadDir)
	volume := filepath.VolumeName(storedPath)
	withoutVolume := strings.TrimPrefix(storedPath, volume)
	withoutVolume = strings.TrimLeft(withoutVolume, string(filepath.Separator))
	parts := strings.Split(withoutVolume, string(filepath.Separator))
	if len(parts) < 2 || parts[0] != uploadBase {
		return "", false
	}
	return filepath.Join(parts[1:]...), true
}

func isPathInside(parent, child string) bool {
	rel, err := filepath.Rel(parent, child)
	if err != nil {
		return false
	}
	return rel == "." || (rel != ".." && !strings.HasPrefix(rel, ".."+string(filepath.Separator)))
}
