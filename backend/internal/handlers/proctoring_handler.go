package handlers

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

type ProctoringHandler struct {
	service services.ProctoringService
	cfg     config.Config
}

func NewProctoringHandler(service services.ProctoringService, cfg config.Config) *ProctoringHandler {
	return &ProctoringHandler{service: service, cfg: cfg}
}

func (h *ProctoringHandler) LogEvent(c *fiber.Ctx) error {
	var input dto.ProctoringEventRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	if !dto.IsAllowedProctoringEventType(input.EventType) {
		return response.Error(c, fiber.StatusBadRequest, "invalid proctoring event type", nil)
	}

	event, err := h.service.LogEvent(userID(c), input, c.IP(), c.Get("User-Agent"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "proctoring event logged", event)
}

func (h *ProctoringHandler) UploadSnapshot(c *fiber.Ctx) error {
	file, err := c.FormFile("snapshot")
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "snapshot image is required", nil)
	}

	ext, err := validateSensitiveImageUpload(file)
	if err != nil {
		return uploadValidationResponse(c, err)
	}

	filename := fmt.Sprintf("snapshot_%s%s", uuid.NewString(), ext)
	storageKey := privateUploadKey("proctoring", c.Params("submission_id"), filename)
	diskPath := uploadDiskPath(h.cfg, storageKey)
	if err := os.MkdirAll(filepath.Dir(diskPath), 0750); err != nil {
		return handleError(c, err)
	}
	if err := c.SaveFile(file, diskPath); err != nil {
		return handleError(c, err)
	}

	snapshot, err := h.service.SaveSnapshot(userID(c), c.Params("submission_id"), storageKey)
	if err != nil {
		_ = os.Remove(diskPath)
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "proctoring snapshot uploaded", snapshot)
}

func (h *ProctoringHandler) SnapshotImage(c *fiber.Ctx) error {
	path, err := h.service.SnapshotPath(c.Params("snapshot_id"))
	if err != nil {
		return handleError(c, err)
	}
	return servePrivateFile(c, h.cfg, path)
}

func (h *ProctoringHandler) Events(c *fiber.Ctx) error {
	page, limit := pagination(c)
	items, total, err := h.service.Events(c.Params("submission_id"), page, limit)
	if err != nil {
		return handleError(c, err)
	}
	return response.Paginated(c, "proctoring events", items, response.Meta{Page: page, Limit: limit, Total: total})
}

func (h *ProctoringHandler) Snapshots(c *fiber.Ctx) error {
	page, limit := pagination(c)
	items, total, err := h.service.Snapshots(c.Params("submission_id"), page, limit)
	if err != nil {
		return handleError(c, err)
	}
	return response.Paginated(c, "proctoring snapshots", items, response.Meta{Page: page, Limit: limit, Total: total})
}

func (h *ProctoringHandler) Summary(c *fiber.Ctx) error {
	summary, err := h.service.Summary(c.Params("submission_id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "proctoring summary", summary)
}
