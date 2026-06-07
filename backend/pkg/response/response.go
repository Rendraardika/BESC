package response

import "github.com/gofiber/fiber/v2"

type Meta struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total,omitempty"`
}

type Body struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

func JSON(c *fiber.Ctx, status int, message string, data interface{}) error {
	return c.Status(status).JSON(Body{Success: status < 400, Message: message, Data: data})
}

func Paginated(c *fiber.Ctx, message string, data interface{}, meta Meta) error {
	return c.Status(fiber.StatusOK).JSON(Body{Success: true, Message: message, Data: data, Meta: &meta})
}

func Error(c *fiber.Ctx, status int, message string, errors interface{}) error {
	return c.Status(status).JSON(Body{Success: false, Message: message, Errors: errors})
}
