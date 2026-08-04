package handlers

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"online-competition-platform/pkg/response"
)

type UserTeamHandler struct {
	db *sql.DB
}

func NewUserTeamHandler(db *sql.DB) *UserTeamHandler {
	return &UserTeamHandler{db: db}
}

type userTeamInput struct {
	Name         string `json:"name"`
	LeaderName   string `json:"leader_name"`
	LeaderEmail  string `json:"leader_email"`
	LeaderPhone  string `json:"leader_phone"`
	LeaderNISN   string `json:"leader_nisn"`
	LeaderKelas  string `json:"leader_kelas"`
	Member1Name  string `json:"member1_name"`
	Member1Email string `json:"member1_email"`
	Member1NISN  string `json:"member1_nisn"`
	Member1Kelas string `json:"member1_kelas"`
	Member2Name  string `json:"member2_name"`
	Member2Email string `json:"member2_email"`
	Member2NISN  string `json:"member2_nisn"`
	Member2Kelas string `json:"member2_kelas"`
	Institution  string `json:"institution"`
	Province     string `json:"province"`
	City         string `json:"city"`
	Address      string `json:"address"`
	GuardianName string `json:"guardian_name"`
	GuardianHP   string `json:"guardian_hp"`
	GuardianEmail string `json:"guardian_email"`
	Category     string `json:"category"`
	AbstractTitle string `json:"abstract_title"`
	Subtema      string `json:"subtema"`
}

func (h *UserTeamHandler) SubmitTeam(c *fiber.Ctx) error {
	var input userTeamInput
	if err := bindAndValidate(c, &input); err != nil {
		return err
	}

	// Check if user already has a team for this category
	userID := userID(c)
	var existingID string
	err := h.db.QueryRow("SELECT id FROM teams WHERE user_id = ? AND category = ?", userID, input.Category).Scan(&existingID)

	category := input.Category
	if category == "" {
		category = "Umum"
	}

	notes := ""
	if input.AbstractTitle != "" {
		notes = "Judul: " + input.AbstractTitle
		if input.Subtema != "" {
			notes += " | Subtema: " + input.Subtema
		}
	}

	if err == sql.ErrNoRows {
		// Create new team
		_, err = h.db.Exec(
			`INSERT INTO teams (id, user_id, name, leader_name, leader_email, leader_phone, leader_nisn, member1_name, member1_email, member1_nisn, member2_name, member2_email, member2_nisn, institution, province, city, address, guardian_name, guardian_hp, guardian_email, category, status, notes)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
			uuid.NewString(), userID, input.Name, input.LeaderName, input.LeaderEmail, input.LeaderPhone, input.LeaderNISN,
			input.Member1Name, input.Member1Email, input.Member1NISN,
			input.Member2Name, input.Member2Email, input.Member2NISN,
			input.Institution, input.Province, input.City, input.Address,
			input.GuardianName, input.GuardianHP, input.GuardianEmail,
			category, notes,
		)
	} else if err == nil {
		// Update existing team
		_, err = h.db.Exec(
			`UPDATE teams SET name=?, leader_name=?, leader_email=?, leader_phone=?, leader_nisn=?, member1_name=?, member1_email=?, member1_nisn=?, member2_name=?, member2_email=?, member2_nisn=?, institution=?, province=?, city=?, address=?, guardian_name=?, guardian_hp=?, guardian_email=?, notes=? WHERE id=?`,
			input.Name, input.LeaderName, input.LeaderEmail, input.LeaderPhone, input.LeaderNISN,
			input.Member1Name, input.Member1Email, input.Member1NISN,
			input.Member2Name, input.Member2Email, input.Member2NISN,
			input.Institution, input.Province, input.City, input.Address,
			input.GuardianName, input.GuardianHP, input.GuardianEmail,
			notes, existingID,
		)
	}

	if err != nil {
		return handleError(c, err)
	}

	return response.JSON(c, fiber.StatusOK, "team data saved", nil)
}
