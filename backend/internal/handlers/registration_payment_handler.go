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
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return response.Error(c, fiber.StatusBadRequest, "proof must be jpg, jpeg, png, or webp", nil)
	}
	filename := fmt.Sprintf("%s%s", uuid.NewString(), ext)
	relativePath := filepath.Join(h.cfg.UploadDir, "payments", filename)
	if err := os.MkdirAll(filepath.Dir(relativePath), 0755); err != nil {
		return handleError(c, err)
	}
	if err := c.SaveFile(file, relativePath); err != nil {
		return handleError(c, err)
	}
	payment, err := h.service.UploadProof(userID(c), c.Params("registration_id"), relativePath)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "payment proof uploaded", payment)
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
