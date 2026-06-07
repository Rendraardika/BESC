package handlers

import (
	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

type CompetitionHandler struct {
	service services.CompetitionService
}

func NewCompetitionHandler(service services.CompetitionService) *CompetitionHandler {
	return &CompetitionHandler{service: service}
}

func (h *CompetitionHandler) Create(c *fiber.Ctx) error {
	var input dto.CompetitionRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	item, err := h.service.Create(input)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "competition created", item)
}

func (h *CompetitionHandler) Update(c *fiber.Ctx) error {
	var input dto.CompetitionRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	item, err := h.service.Update(c.Params("id"), input)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "competition updated", item)
}

func (h *CompetitionHandler) Delete(c *fiber.Ctx) error {
	if err := h.service.Delete(c.Params("id")); err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "competition deleted", nil)
}

func (h *CompetitionHandler) Detail(c *fiber.Ctx) error {
	item, err := h.service.Get(c.Params("id"))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "competition detail", item)
}

func (h *CompetitionHandler) List(c *fiber.Ctx) error {
	page, limit := pagination(c)
	items, total, err := h.service.List(page, limit)
	if err != nil {
		return handleError(c, err)
	}
	return response.Paginated(c, "competition list", items, response.Meta{Page: page, Limit: limit, Total: total})
}
