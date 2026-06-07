package handlers

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/utils"
	"online-competition-platform/pkg/response"
)

func userID(c *fiber.Ctx) string {
	value, _ := c.Locals("user_id").(string)
	return value
}

func pagination(c *fiber.Ctx) (int, int) {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	return utils.Pagination(page, limit)
}

func bindAndValidate(c *fiber.Ctx, input interface{}) error {
	if err := c.BodyParser(input); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid request body", err.Error())
	}
	if errors := utils.Validate(input); errors != nil {
		return response.Error(c, fiber.StatusUnprocessableEntity, "validation failed", errors)
	}
	return nil
}

func handleError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, utils.ErrNotFound):
		return response.Error(c, fiber.StatusNotFound, "resource not found", nil)
	case errors.Is(err, utils.ErrUnauthorized):
		return response.Error(c, fiber.StatusUnauthorized, "invalid credentials", nil)
	case errors.Is(err, utils.ErrForbidden):
		return response.Error(c, fiber.StatusForbidden, "forbidden", nil)
	case errors.Is(err, utils.ErrConflict):
		return response.Error(c, fiber.StatusConflict, "resource already exists", nil)
	case errors.Is(err, utils.ErrInvalidInput):
		return response.Error(c, fiber.StatusBadRequest, "invalid input", nil)
	case errors.Is(err, utils.ErrPaymentPending):
		return response.Error(c, fiber.StatusForbidden, "payment is not verified", nil)
	case errors.Is(err, utils.ErrExamSubmitted):
		return response.Error(c, fiber.StatusConflict, "exam already submitted", nil)
	default:
		return response.Error(c, fiber.StatusInternalServerError, "internal server error", err.Error())
	}
}
