package handlers

import (
	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

type AuthHandler struct {
	service services.AuthService
}

func NewAuthHandler(service services.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
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
	return response.JSON(c, fiber.StatusOK, "logged in with google successfully", result)
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
