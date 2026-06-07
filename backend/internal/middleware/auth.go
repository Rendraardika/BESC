package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
	"online-competition-platform/pkg/response"
)

func JWT(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			return response.Error(c, fiber.StatusUnauthorized, "missing bearer token", nil)
		}
		claims, err := utils.ParseToken(strings.TrimPrefix(header, "Bearer "), secret)
		if err != nil {
			return response.Error(c, fiber.StatusUnauthorized, "invalid or expired token", nil)
		}
		c.Locals("user_id", claims.UserID)
		c.Locals("role", claims.Role)
		return c.Next()
	}
}

func Admin(c *fiber.Ctx) error {
	if c.Locals("role") != entities.RoleAdmin {
		return response.Error(c, fiber.StatusForbidden, "admin access required", nil)
	}
	return c.Next()
}
