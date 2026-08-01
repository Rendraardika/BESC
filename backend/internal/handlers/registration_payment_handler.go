package handlers

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/services"
	"online-competition-platform/internal/utils"
	"online-competition-platform/pkg/response"
)

type RegistrationHandler struct {
	service services.RegistrationService
}

type PaymentHandler struct {
	service services.PaymentService
	cfg     config.Config
}

func NewRegistrationHandler(service services.RegistrationService) *RegistrationHandler {
	return &RegistrationHandler{service: service}
}

func NewPaymentHandler(service services.PaymentService, cfg config.Config) *PaymentHandler {
	return &PaymentHandler{service: service, cfg: cfg}
}

func (h *RegistrationHandler) RegisterCompetition(c *fiber.Ctx) error {
	item, err := h.service.Register(userID(c), c.Params("competition_id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "competition registration created", item)
}

func (h *RegistrationHandler) MyCompetitions(c *fiber.Ctx) error {
	page, limit := pagination(c)
	items, total, err := h.service.MyCompetitions(userID(c), page, limit)
	if err != nil {
		return handleError(c, err)
	}
	return response.Paginated(c, "my competitions", items, response.Meta{Page: page, Limit: limit, Total: total})
}

func (h *PaymentHandler) UploadProof(c *fiber.Ctx) error {
	file, err := c.FormFile("proof")
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "proof image is required", nil)
	}
	ext, err := validateSensitiveImageUpload(file)
	if err != nil {
		return uploadValidationResponse(c, err)
	}
	filename := fmt.Sprintf("payment_%s%s", uuid.NewString(), ext)
	storageKey := privateUploadKey("payments", filename)
	diskPath := uploadDiskPath(h.cfg, storageKey)
	if err := os.MkdirAll(filepath.Dir(diskPath), 0750); err != nil {
		return handleError(c, err)
	}
	if err := c.SaveFile(file, diskPath); err != nil {
		return handleError(c, err)
	}
	payment, err := h.service.UploadProof(userID(c), c.Params("registration_id"), storageKey)
	if err != nil {
		_ = os.Remove(diskPath)
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "payment proof uploaded", payment)
}

func (h *PaymentHandler) Proof(c *fiber.Ctx) error {
	path, err := h.service.ProofPath(c.Params("payment_id"))
	if err != nil {
		return handleError(c, err)
	}
	diskPath, err := resolveUploadPath(h.cfg.UploadDir, path)
	if err != nil {
		return handleError(c, err)
	}
	if _, err := os.Stat(diskPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return handleError(c, utils.ErrNotFound)
		}
		return handleError(c, err)
	}
	if err := h.service.MarkProofViewed(c.Params("payment_id"), userID(c)); err != nil {
		return handleError(c, err)
	}
	return servePrivateFile(c, h.cfg, path)
}

func (h *PaymentHandler) Status(c *fiber.Ctx) error {
	payment, err := h.service.Status(userID(c), c.Params("registration_id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "payment status", payment)
}

func (h *PaymentHandler) Verify(c *fiber.Ctx) error {
	var input dto.VerifyPaymentRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	if err := h.service.Verify(c.Params("payment_id"), input.Status, userID(c)); err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "payment updated", nil)
}
