package middleware

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestOriginGuardAllowsConfiguredOrigin(t *testing.T) {
	app := originGuardTestApp()
	req := httptest.NewRequest(fiber.MethodPost, "/state-change", nil)
	req.Header.Set("Origin", "https://example.com")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestOriginGuardRejectsDisallowedOrigin(t *testing.T) {
	app := originGuardTestApp()
	req := httptest.NewRequest(fiber.MethodPost, "/state-change", nil)
	req.Header.Set("Origin", "https://evil.example")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("expected 403, got %d", resp.StatusCode)
	}
}

func TestOriginGuardAllowsMissingOriginForNonBrowserClients(t *testing.T) {
	app := originGuardTestApp()

	resp, err := app.Test(httptest.NewRequest(fiber.MethodPost, "/state-change", nil))
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func originGuardTestApp() *fiber.App {
	app := fiber.New()
	app.Use(OriginGuard("https://example.com,http://localhost:5173"))
	app.Post("/state-change", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})
	return app
}
