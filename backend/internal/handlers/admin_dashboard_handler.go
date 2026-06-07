package handlers

import (
	"github.com/gofiber/fiber/v2"

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
