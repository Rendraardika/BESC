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

func (h *UserTeamHandler) GetMyTeam(c *fiber.Ctx) error {
	userID := userID(c)
	category := c.Query("category", "")

	var team map[string]interface{}
	team = make(map[string]interface{})

	if category != "" {
		err := h.db.QueryRow(`
			SELECT id, COALESCE(user_id,''), name, leader_name, leader_email, leader_phone,
				COALESCE(leader_nisn,''), COALESCE(leader_kelas,''), COALESCE(leader_ig,''), COALESCE(leader_tiktok,''),
				member1_name, member1_email, COALESCE(member1_nisn,''), COALESCE(member1_kelas,''), COALESCE(member1_ig,''), COALESCE(member1_tiktok,''),
				member2_name, member2_email, COALESCE(member2_nisn,''), COALESCE(member2_kelas,''), COALESCE(member2_ig,''), COALESCE(member2_tiktok,''),
				institution, COALESCE(province,''), COALESCE(city,''), COALESCE(address,''),
				COALESCE(guardian_name,''), COALESCE(guardian_hp,''), COALESCE(guardian_email,''),
				COALESCE(notes,'')
			FROM teams WHERE user_id = ? AND category = ? LIMIT 1
		`, userID, category).Scan(
			&team["id"], &team["user_id"], &team["name"],
			&team["leader_name"], &team["leader_email"], &team["leader_phone"],
			&team["leader_nisn"], &team["leader_kelas"], &team["leader_ig"], &team["leader_tiktok"],
			&team["member1_name"], &team["member1_email"], &team["member1_nisn"], &team["member1_kelas"], &team["member1_ig"], &team["member1_tiktok"],
			&team["member2_name"], &team["member2_email"], &team["member2_nisn"], &team["member2_kelas"], &team["member2_ig"], &team["member2_tiktok"],
			&team["institution"], &team["province"], &team["city"], &team["address"],
			&team["guardian_name"], &team["guardian_hp"], &team["guardian_email"],
			&team["notes"],
		)
		if err != nil {
			return response.JSON(c, fiber.StatusOK, "no team found", nil)
		}
	} else {
		err := h.db.QueryRow(`
			SELECT id, COALESCE(user_id,''), name, leader_name, leader_email, leader_phone,
				COALESCE(leader_nisn,''), COALESCE(leader_kelas,''), COALESCE(leader_ig,''), COALESCE(leader_tiktok,''),
				member1_name, member1_email, COALESCE(member1_nisn,''), COALESCE(member1_kelas,''), COALESCE(member1_ig,''), COALESCE(member1_tiktok,''),
				member2_name, member2_email, COALESCE(member2_nisn,''), COALESCE(member2_kelas,''), COALESCE(member2_ig,''), COALESCE(member2_tiktok,''),
				institution, COALESCE(province,''), COALESCE(city,''), COALESCE(address,''),
				COALESCE(guardian_name,''), COALESCE(guardian_hp,''), COALESCE(guardian_email,''),
				COALESCE(notes,'')
			FROM teams WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
		`, userID).Scan(
			&team["id"], &team["user_id"], &team["name"],
			&team["leader_name"], &team["leader_email"], &team["leader_phone"],
			&team["leader_nisn"], &team["leader_kelas"], &team["leader_ig"], &team["leader_tiktok"],
			&team["member1_name"], &team["member1_email"], &team["member1_nisn"], &team["member1_kelas"], &team["member1_ig"], &team["member1_tiktok"],
			&team["member2_name"], &team["member2_email"], &team["member2_nisn"], &team["member2_kelas"], &team["member2_ig"], &team["member2_tiktok"],
			&team["institution"], &team["province"], &team["city"], &team["address"],
			&team["guardian_name"], &team["guardian_hp"], &team["guardian_email"],
			&team["notes"],
		)
		if err != nil {
			return response.JSON(c, fiber.StatusOK, "no team found", nil)
		}
	}

	return response.JSON(c, fiber.StatusOK, "team data", team)
}

type userTeamInput struct {
	Name          string `json:"name"`
	LeaderName    string `json:"leader_name"`
	LeaderEmail   string `json:"leader_email"`
	LeaderPhone   string `json:"leader_phone"`
	LeaderNISN    string `json:"leader_nisn"`
	LeaderKelas   string `json:"leader_kelas"`
	LeaderIG      string `json:"leader_ig"`
	LeaderTikTok  string `json:"leader_tiktok"`
	Member1Name   string `json:"member1_name"`
	Member1Email  string `json:"member1_email"`
	Member1NISN   string `json:"member1_nisn"`
	Member1Kelas  string `json:"member1_kelas"`
	Member1IG     string `json:"member1_ig"`
	Member1TikTok string `json:"member1_tiktok"`
	Member2Name   string `json:"member2_name"`
	Member2Email  string `json:"member2_email"`
	Member2NISN   string `json:"member2_nisn"`
	Member2Kelas  string `json:"member2_kelas"`
	Member2IG     string `json:"member2_ig"`
	Member2TikTok string `json:"member2_tiktok"`
	Institution   string `json:"institution"`
	Province      string `json:"province"`
	City          string `json:"city"`
	Address       string `json:"address"`
	GuardianName  string `json:"guardian_name"`
	GuardianHP    string `json:"guardian_hp"`
	GuardianEmail string `json:"guardian_email"`
	Category      string `json:"category"`
	AbstractTitle string `json:"abstract_title"`
	Subtema       string `json:"subtema"`
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
			`INSERT INTO teams (id, user_id, name, leader_name, leader_email, leader_phone, leader_nisn, leader_kelas, leader_ig, leader_tiktok, member1_name, member1_email, member1_nisn, member1_kelas, member1_ig, member1_tiktok, member2_name, member2_email, member2_nisn, member2_kelas, member2_ig, member2_tiktok, institution, province, city, address, guardian_name, guardian_hp, guardian_email, category, status, notes)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
			uuid.NewString(), userID, input.Name, input.LeaderName, input.LeaderEmail, input.LeaderPhone, input.LeaderNISN, input.LeaderKelas, input.LeaderIG, input.LeaderTikTok,
			input.Member1Name, input.Member1Email, input.Member1NISN, input.Member1Kelas, input.Member1IG, input.Member1TikTok,
			input.Member2Name, input.Member2Email, input.Member2NISN, input.Member2Kelas, input.Member2IG, input.Member2TikTok,
			input.Institution, input.Province, input.City, input.Address,
			input.GuardianName, input.GuardianHP, input.GuardianEmail,
			category, notes,
		)
	} else if err == nil {
		// Update existing team
		_, err = h.db.Exec(
			`UPDATE teams SET name=?, leader_name=?, leader_email=?, leader_phone=?, leader_nisn=?, leader_kelas=?, leader_ig=?, leader_tiktok=?, member1_name=?, member1_email=?, member1_nisn=?, member1_kelas=?, member1_ig=?, member1_tiktok=?, member2_name=?, member2_email=?, member2_nisn=?, member2_kelas=?, member2_ig=?, member2_tiktok=?, institution=?, province=?, city=?, address=?, guardian_name=?, guardian_hp=?, guardian_email=?, notes=? WHERE id=?`,
			input.Name, input.LeaderName, input.LeaderEmail, input.LeaderPhone, input.LeaderNISN, input.LeaderKelas, input.LeaderIG, input.LeaderTikTok,
			input.Member1Name, input.Member1Email, input.Member1NISN, input.Member1Kelas, input.Member1IG, input.Member1TikTok,
			input.Member2Name, input.Member2Email, input.Member2NISN, input.Member2Kelas, input.Member2IG, input.Member2TikTok,
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
