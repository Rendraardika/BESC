package handlers

import (
	"errors"
	"io"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/utils"
)

func TestHandleErrorHidesInternalErrorDetails(t *testing.T) {
	app := fiber.New()
	app.Get("/boom", func(c *fiber.Ctx) error {
		return handleError(c, errors.New("sql: connection refused at internal-host"))
	})

	resp, err := app.Test(httptest.NewRequest(fiber.MethodGet, "/boom", nil))
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read body failed: %v", err)
	}

	if resp.StatusCode != fiber.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", resp.StatusCode)
	}
	text := string(body)
	if !strings.Contains(text, "internal server error") {
		t.Fatalf("expected generic message, got %s", text)
	}
	if strings.Contains(text, "connection refused") || strings.Contains(text, "internal-host") || strings.Contains(text, "sql:") {
		t.Fatalf("internal details leaked in response: %s", text)
	}
}

func TestHandleErrorKeepsDomainErrorMapping(t *testing.T) {
	app := fiber.New()
	app.Get("/conflict", func(c *fiber.Ctx) error {
		return handleError(c, utils.ErrConflict)
	})

	resp, err := app.Test(httptest.NewRequest(fiber.MethodGet, "/conflict", nil))
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusConflict {
		t.Fatalf("expected 409, got %d", resp.StatusCode)
	}
}
