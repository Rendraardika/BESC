package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/pkg/response"
)

func OriginGuard(allowedOrigins string) fiber.Handler {
	allowed := allowedOriginSet(allowedOrigins)
	return func(c *fiber.Ctx) error {
		if !isStateChangingMethod(c.Method()) {
			return c.Next()
		}
		origin := strings.TrimSpace(c.Get("Origin"))
		if origin == "" {
			return c.Next()
		}
		if allowed[origin] {
			return c.Next()
		}
		return response.Error(c, fiber.StatusForbidden, "origin is not allowed", nil)
	}
}

func allowedOriginSet(value string) map[string]bool {
	out := map[string]bool{}
	for _, origin := range strings.Split(value, ",") {
		origin = strings.TrimSpace(origin)
		if origin == "" || origin == "*" {
			continue
		}
		out[origin] = true
	}
	return out
}

func isStateChangingMethod(method string) bool {
	switch method {
	case fiber.MethodPost, fiber.MethodPut, fiber.MethodPatch, fiber.MethodDelete:
		return true
	default:
		return false
	}
}
