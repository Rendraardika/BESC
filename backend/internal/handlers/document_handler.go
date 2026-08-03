package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"online-competition-platform/config"
	"online-competition-platform/internal/utils"
	"online-competition-platform/pkg/response"
)

type DocumentHandler struct {
	db  *sql.DB
	cfg config.Config
}

func NewDocumentHandler(db *sql.DB, cfg config.Config) *DocumentHandler {
	return &DocumentHandler{db: db, cfg: cfg}
}

func (h *DocumentHandler) UploadDocuments(c *fiber.Ctx) error {
	registrationID := c.Params("registration_id")

	form, err := c.MultipartForm()
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid form data", nil)
	}

	files := form.File["documents"]
	docTypes := form.Value["doc_types"]

	if len(files) == 0 {
		return response.Error(c, fiber.StatusBadRequest, "no documents uploaded", nil)
	}

	for i, file := range files {
		docType := "unknown"
		if i < len(docTypes) {
			docType = docTypes[i]
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("doc_%s_%s%s", uuid.NewString(), docType, ext)
		storageKey := fmt.Sprintf("registrations/%s/%s", registrationID, filename)
		diskPath := filepath.Join(h.cfg.UploadDir, "private", storageKey)

		if err := os.MkdirAll(filepath.Dir(diskPath), 0750); err != nil {
			return handleError(c, err)
		}
		if err := c.SaveFile(file, diskPath); err != nil {
			return handleError(c, err)
		}

		_, err := h.db.Exec(
			"INSERT INTO registration_documents (id, registration_id, doc_type, file_path, original_name) VALUES (?, ?, ?, ?, ?)",
			uuid.NewString(), registrationID, docType, storageKey, file.Filename,
		)
		if err != nil {
			return handleError(c, err)
		}
	}

	return response.JSON(c, fiber.StatusCreated, "documents uploaded", nil)
}

func (h *DocumentHandler) ListDocuments(c *fiber.Ctx) error {
	registrationID := c.Params("registration_id")
	rows, err := h.db.Query(
		"SELECT id, registration_id, doc_type, file_path, original_name, created_at FROM registration_documents WHERE registration_id = ? ORDER BY created_at",
		registrationID,
	)
	if err != nil {
		return handleError(c, err)
	}
	defer rows.Close()

	type Doc struct {
		ID           string `json:"id"`
		RegistrationID string `json:"registration_id"`
		DocType      string `json:"doc_type"`
		FilePath     string `json:"file_path"`
		OriginalName string `json:"original_name"`
		CreatedAt    string `json:"created_at"`
	}

	var docs []Doc
	for rows.Next() {
		var d Doc
		if err := rows.Scan(&d.ID, &d.RegistrationID, &d.DocType, &d.FilePath, &d.OriginalName, &d.CreatedAt); err != nil {
			continue
		}
		docs = append(docs, d)
	}

	return response.JSON(c, fiber.StatusOK, "documents", docs)
}

func (h *DocumentHandler) ViewDocument(c *fiber.Ctx) error {
	docID := c.Params("doc_id")
	var filePath string
	err := h.db.QueryRow("SELECT file_path FROM registration_documents WHERE id = ?", docID).Scan(&filePath)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return handleError(c, utils.ErrNotFound)
		}
		return handleError(c, err)
	}

	diskPath := filepath.Join(h.cfg.UploadDir, "private", filePath)
	if _, err := os.Stat(diskPath); err != nil {
		return handleError(c, utils.ErrNotFound)
	}

	return servePrivateFile(c, h.cfg, filePath)
}
