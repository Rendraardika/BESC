package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/services"
	"online-competition-platform/internal/utils"
	"online-competition-platform/pkg/response"
)

type AuthHandler struct {
	service services.AuthService
	cfg     config.Config
}

func NewAuthHandler(service services.AuthService, cfg config.Config) *AuthHandler {
	return &AuthHandler{service: service, cfg: cfg}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var input dto.RegisterRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	result, err := h.service.Register(input)
	if err != nil {
		return handleError(c, err)
	}
	result.Token = ""
	return response.JSON(c, fiber.StatusCreated, "registered successfully", result)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var input dto.LoginRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	result, err := h.service.Login(input)
	if err != nil {
		return handleError(c, err)
	}
	h.setSessionCookie(c, result.Token)
	result.Token = ""
	return response.JSON(c, fiber.StatusOK, "logged in successfully", result)
}

func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	var input dto.GoogleLoginRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	result, err := h.service.GoogleLogin(input)
	if err != nil {
		return handleError(c, err)
	}
	h.setSessionCookie(c, result.Token)
	result.Token = ""
	return response.JSON(c, fiber.StatusOK, "logged in with google successfully", result)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	h.clearSessionCookie(c)
	return response.JSON(c, fiber.StatusOK, "logged out successfully", nil)
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	user, err := h.service.CurrentUser(userID(c))
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "current user", user)
}

func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	var input dto.UpdateProfileRequest
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}
	user, err := h.service.UpdateProfile(userID(c), input)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "profile updated", user)
}

func (h *AuthHandler) setSessionCookie(c *fiber.Ctx, token string) {
	// Use Secure only when the original request came via HTTPS (e.g. Traefik reverse proxy)
	secure := h.cfg.AppEnv == "production" && isSecureRequest(c)
	c.Cookie(&fiber.Cookie{
		Name:     utils.AuthCookieName,
		Value:    token,
		Path:     "/",
		Expires:  time.Now().Add(h.cfg.JWTExpires),
		MaxAge:   int(h.cfg.JWTExpires.Seconds()),
		Secure:   secure,
		HTTPOnly: true,
		SameSite: "Lax",
	})
}

func (h *AuthHandler) clearSessionCookie(c *fiber.Ctx) {
	secure := h.cfg.AppEnv == "production" && isSecureRequest(c)
	c.Cookie(&fiber.Cookie{
		Name:     utils.AuthCookieName,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		Secure:   secure,
		HTTPOnly: true,
		SameSite: "Lax",
	})
}

func isSecureRequest(c *fiber.Ctx) bool {
	// Check X-Forwarded-Proto header (set by Traefik/reverse proxy)
	proto := string(c.Request().Header.Peek("X-Forwarded-Proto"))
	if proto == "https" {
		return true
	}
	// Check X-Forwarded-SSL header
	ssl := string(c.Request().Header.Peek("X-Forwarded-SSL"))
	if ssl == "on" {
		return true
	}
	return c.Protocol() == "https"
}
