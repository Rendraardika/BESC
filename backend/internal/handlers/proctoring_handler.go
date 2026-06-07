package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

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

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return response.Error(c, fiber.StatusBadRequest, "snapshot must be jpg, jpeg, png, or webp", nil)
	}

	filename := fmt.Sprintf("%s%s", uuid.NewString(), ext)
	relativePath := filepath.Join(h.cfg.UploadDir, "proctoring", c.Params("submission_id"), filename)
	if err := os.MkdirAll(filepath.Dir(relativePath), 0755); err != nil {
		return handleError(c, err)
	}
	if err := c.SaveFile(file, relativePath); err != nil {
		return handleError(c, err)
	}

	snapshot, err := h.service.SaveSnapshot(userID(c), c.Params("submission_id"), relativePath)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "proctoring snapshot uploaded", snapshot)
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
