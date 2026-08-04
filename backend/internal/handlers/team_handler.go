package handlers

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/services"
	"online-competition-platform/pkg/response"
)

type TeamHandler struct {
	service services.TeamService
	db      *sql.DB
}

func NewTeamHandler(service services.TeamService, db *sql.DB) *TeamHandler {
	return &TeamHandler{service: service, db: db}
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
	// Try to get teams from teams table first
	teams, err := h.service.List()
	if err != nil {
		teams = []entities.Team{}
	}

	// Also get teams from users table (registration data)
	teamsFromUsers := h.teamsFromUsers()

	// Merge: use teams from users table as base, then add teams table entries that aren't duplicates
	existingNames := make(map[string]bool)
	for _, t := range teams {
		existingNames[t.Name] = true
	}
	for _, t := range teamsFromUsers {
		if !existingNames[t.Name] {
			teams = append(teams, t)
		}
	}

	return response.JSON(c, fiber.StatusOK, "teams", teams)
}

func (h *TeamHandler) teamsFromUsers() []entities.Team {
	rows, err := h.db.Query(`
		SELECT 
			u.id as user_id,
			COALESCE(u.team_name, '') as team_name,
			u.name as leader_name,
			u.email as leader_email,
			COALESCE(u.phone, '') as leader_phone,
			COALESCE(u.member1_name, '') as member1_name,
			COALESCE(u.member2_name, '') as member2_name,
			COALESCE(u.institution, '') as institution,
			'Umum' as category,
			'active' as status,
			r.created_at
		FROM registrations r
		JOIN users u ON u.id = r.user_id
		WHERE u.team_name != '' AND u.team_name IS NOT NULL
		GROUP BY u.id
		ORDER BY r.created_at DESC
		LIMIT 100
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	items := []entities.Team{}
	for rows.Next() {
		var item entities.Team
		var createdAt interface{}
		if err := rows.Scan(&item.UserID, &item.Name, &item.LeaderName, &item.LeaderEmail, &item.LeaderPhone, &item.Member1Name, &item.Member2Name, &item.Institution, &item.Category, &item.Status, &createdAt); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items
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
