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
		// Allow requests when host matches the server host (handles reverse proxy scenarios)
		host := strings.TrimSpace(c.Get("Host"))
		if host != "" && strings.Contains(origin, host) {
			return c.Next()
		}
		// Allow when origin scheme+host matches X-Forwarded-Host (for Traefik/Hostinger)
		forwardedHost := strings.TrimSpace(c.Get("X-Forwarded-Host"))
		if forwardedHost != "" && strings.Contains(origin, forwardedHost) {
			return c.Next()
		}
		// Allow when origin matches any IP or hostname in allowed origins list
		originHost := extractHost(origin)
		if originHost != "" {
			for allowedOrigin := range allowed {
				allowedHost := extractHost(allowedOrigin)
				if allowedHost != "" && originHost == allowedHost {
					return c.Next()
				}
			}
		}
		return response.Error(c, fiber.StatusForbidden, "origin is not allowed", nil)
	}
}

func extractHost(origin string) string {
	origin = strings.TrimPrefix(origin, "http://")
	origin = strings.TrimPrefix(origin, "https://")
	origin = strings.Split(origin, ":")[0]
	origin = strings.TrimSuffix(origin, "/")
	return origin
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
