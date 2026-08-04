package handlers

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/internal/entities"
	"online-competition-platform/pkg/response"
)

type TeamHandler struct {
	db *sql.DB
}

func NewTeamHandler(db *sql.DB) *TeamHandler {
	return &TeamHandler{db: db}
}

func (h *TeamHandler) List(c *fiber.Ctx) error {
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
			COALESCE(c.category, 'Umum') as category,
			COALESCE(r.status, 'pending') as status,
			COALESCE(c.title, '') as notes,
			r.created_at,
			r.created_at
		FROM users u
		LEFT JOIN registrations r ON r.user_id = u.id
		LEFT JOIN competitions c ON c.id = r.competition_id
		WHERE u.role = 'user' 
			AND u.team_name IS NOT NULL 
			AND u.team_name != ''
		ORDER BY r.created_at DESC
	`)
	if err != nil {
		return response.JSON(c, fiber.StatusOK, "teams", []entities.Team{})
	}
	defer rows.Close()

	items := []entities.Team{}
	for rows.Next() {
		var item entities.Team
		if err := rows.Scan(&item.UserID, &item.Name, &item.LeaderName, &item.LeaderEmail, &item.LeaderPhone, &item.Member1Name, &item.Member2Name, &item.Institution, &item.Category, &item.Status, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			continue
		}
		items = append(items, item)
	}
	return response.JSON(c, fiber.StatusOK, "teams", items)
}

func (h *TeamHandler) Create(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusOK, "teams are managed through user registration", nil)
}

func (h *TeamHandler) Update(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusOK, "teams are managed through user registration", nil)
}

func (h *TeamHandler) Delete(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusOK, "teams are managed through user registration", nil)
}
