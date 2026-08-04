package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

type TeamHandler struct {
	service services.TeamService
}

func NewTeamHandler(service services.TeamService) *TeamHandler {
	return &TeamHandler{service: service}
}

type teamInput struct {
	Name         string `json:"name"`
	LeaderName   string `json:"leader_name"`
	LeaderEmail  string `json:"leader_email"`
	LeaderPhone  string `json:"leader_phone"`
	Member1Name  string `json:"member1_name"`
	Member1Email string `json:"member1_email"`
	Member2Name  string `json:"member2_name"`
	Member2Email string `json:"member2_email"`
	Institution  string `json:"institution"`
	Category     string `json:"category"`
	Status       string `json:"status"`
	Notes        string `json:"notes"`
}

func (h *TeamHandler) List(c *fiber.Ctx) error {
	teams, err := h.service.List()
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "teams", teams)
}

func (h *TeamHandler) Create(c *fiber.Ctx) error {
	var input teamInput
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}

	team := &entities.Team{
		ID:           uuid.NewString(),
		Name:         input.Name,
		LeaderName:   input.LeaderName,
		LeaderEmail:  input.LeaderEmail,
		LeaderPhone:  input.LeaderPhone,
		Member1Name:  input.Member1Name,
		Member1Email: input.Member1Email,
		Member2Name:  input.Member2Name,
		Member2Email: input.Member2Email,
		Institution:  input.Institution,
		Category:     input.Category,
		Status:       input.Status,
		Notes:        input.Notes,
	}

	if team.Category == "" {
		team.Category = "Umum"
	}
	if team.Status == "" {
		team.Status = "active"
	}

	if err := h.service.Create(team); err != nil {
		return handleError(c, err)
	}

	return response.JSON(c, fiber.StatusCreated, "team created", team)
}

func (h *TeamHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	existing, err := h.service.FindByID(id)
	if err != nil {
		return handleError(c, err)
	}

	var input teamInput
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}

	existing.Name = input.Name
	existing.LeaderName = input.LeaderName
	existing.LeaderEmail = input.LeaderEmail
	existing.LeaderPhone = input.LeaderPhone
	existing.Member1Name = input.Member1Name
	existing.Member1Email = input.Member1Email
	existing.Member2Name = input.Member2Name
	existing.Member2Email = input.Member2Email
	existing.Institution = input.Institution
	if input.Category != "" {
		existing.Category = input.Category
	}
	if input.Status != "" {
		existing.Status = input.Status
	}
	existing.Notes = input.Notes

	if err := h.service.Update(existing); err != nil {
		return handleError(c, err)
	}

	return response.JSON(c, fiber.StatusOK, "team updated", existing)
}

func (h *TeamHandler) Delete(c *fiber.Ctx) error {
	if err := h.service.Delete(c.Params("id")); err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "team deleted", nil)
}
