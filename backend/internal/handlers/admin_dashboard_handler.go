package handlers

import (
	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

type AdminDashboardHandler struct {
	service services.AdminDashboardService
}

func NewAdminDashboardHandler(service services.AdminDashboardService) *AdminDashboardHandler {
	return &AdminDashboardHandler{service: service}
}

func (h *AdminDashboardHandler) Summary(c *fiber.Ctx) error {
	dashboard, err := h.service.Summary()
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "admin dashboard summary", dashboard)
}

func (h *AdminDashboardHandler) Participants(c *fiber.Ctx) error {
	participants, err := h.service.Participants()
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "participants", participants)
}

func (h *AdminDashboardHandler) Participant(c *fiber.Ctx) error {
	participant, err := h.service.Participant(c.Params("id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "participant detail", participant)
}

func (h *AdminDashboardHandler) DeleteParticipant(c *fiber.Ctx) error {
	if err := h.service.DeleteParticipant(c.Params("id")); err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "participant deleted", nil)
}

func (h *AdminDashboardHandler) Payments(c *fiber.Ctx) error {
	payments, err := h.service.Payments()
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "payments", payments)
}

func (h *AdminDashboardHandler) UpdateRegistrationStatus(c *fiber.Ctx) error {
	var input dto.UpdateRegistrationStatusRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	if err := h.service.UpdateRegistrationStatus(c.Params("registration_id"), input.Status); err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "registration status updated", nil)
}
