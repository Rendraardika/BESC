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
	// First try teams table (full registration data)
	rows, err := h.db.Query(`
		SELECT id, COALESCE(user_id,''), name, leader_name, leader_email, leader_phone,
			COALESCE(leader_nisn,''), COALESCE(leader_kelas,''), COALESCE(leader_ig,''), COALESCE(leader_tiktok,''),
			member1_name, member1_email, COALESCE(member1_nisn,''), COALESCE(member1_kelas,''), COALESCE(member1_ig,''), COALESCE(member1_tiktok,''),
			member2_name, member2_email, COALESCE(member2_nisn,''), COALESCE(member2_kelas,''), COALESCE(member2_ig,''), COALESCE(member2_tiktok,''),
			institution, COALESCE(province,''), COALESCE(city,''), COALESCE(address,''),
			COALESCE(guardian_name,''), COALESCE(guardian_hp,''), COALESCE(guardian_email,''),
			category, status, COALESCE(notes,''), created_at, updated_at
		FROM teams ORDER BY created_at DESC
	`)
	if err == nil {
		defer rows.Close()
		items := []entities.Team{}
		for rows.Next() {
			var item entities.Team
			if err := rows.Scan(&item.ID, &item.UserID, &item.Name, &item.LeaderName, &item.LeaderEmail, &item.LeaderPhone,
				&item.LeaderNISN, &item.LeaderKelas, &item.LeaderIG, &item.LeaderTikTok,
				&item.Member1Name, &item.Member1Email, &item.Member1NISN, &item.Member1Kelas, &item.Member1IG, &item.Member1TikTok,
				&item.Member2Name, &item.Member2Email, &item.Member2NISN, &item.Member2Kelas, &item.Member2IG, &item.Member2TikTok,
				&item.Institution, &item.Province, &item.City, &item.Address,
				&item.GuardianName, &item.GuardianHP, &item.GuardianEmail,
				&item.Category, &item.Status, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
				continue
			}
			items = append(items, item)
		}
		if len(items) > 0 {
			return response.JSON(c, fiber.StatusOK, "teams", items)
		}
	}

	// Fallback: query from users table (basic data)
	rows2, err := h.db.Query(`
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
	defer rows2.Close()

	items2 := []entities.Team{}
	for rows2.Next() {
		var item entities.Team
		if err := rows2.Scan(&item.UserID, &item.Name, &item.LeaderName, &item.LeaderEmail, &item.LeaderPhone, &item.Member1Name, &item.Member2Name, &item.Institution, &item.Category, &item.Status, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			continue
		}
		items2 = append(items2, item)
	}
	return response.JSON(c, fiber.StatusOK, "teams", items2)
}

func (h *TeamHandler) Create(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusOK, "teams are managed through user registration", nil)
}

func (h *TeamHandler) Update(c *fiber.Ctx) error {
	return response.JSON(c, fiber.StatusOK, "teams are managed through user registration", nil)
}

func (h *TeamHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	result, err := h.db.Exec("DELETE FROM teams WHERE id = ?", id)
	if err != nil {
		return handleError(c, err)
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return response.JSON(c, fiber.StatusNotFound, "team not found", nil)
	}
	return response.JSON(c, fiber.StatusOK, "team deleted", nil)
}

func (h *TeamHandler) UserDocuments(c *fiber.Ctx) error {
	userID := c.Params("user_id")

	type Doc struct {
		ID             string `json:"id"`
		RegistrationID string `json:"registration_id"`
		DocType        string `json:"doc_type"`
		FilePath       string `json:"file_path"`
		OriginalName   string `json:"original_name"`
		CreatedAt      string `json:"created_at"`
	}

	var docs []Doc

	// Method 1: Direct query by user_id in registrations
	rows, err := h.db.Query(`
		SELECT rd.id, rd.registration_id, rd.doc_type, rd.file_path, rd.original_name, rd.created_at
		FROM registration_documents rd
		JOIN registrations r ON r.id = rd.registration_id
		WHERE r.user_id = ?
		ORDER BY rd.created_at DESC
	`, userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var d Doc
			if err := rows.Scan(&d.ID, &d.RegistrationID, &d.DocType, &d.FilePath, &d.OriginalName, &d.CreatedAt); err != nil {
				continue
			}
			docs = append(docs, d)
		}
	}

	// Method 2: If no docs, try by email
	if len(docs) == 0 {
		var email string
		h.db.QueryRow("SELECT email FROM users WHERE id = ?", userID).Scan(&email)
		if email != "" {
			rows2, err2 := h.db.Query(`
				SELECT rd.id, rd.registration_id, rd.doc_type, rd.file_path, rd.original_name, rd.created_at
				FROM registration_documents rd
				JOIN registrations r ON r.id = rd.registration_id
				JOIN users u ON u.id = r.user_id
				WHERE u.email = ?
				ORDER BY rd.created_at DESC
			`, email)
			if err2 == nil {
				defer rows2.Close()
				for rows2.Next() {
					var d Doc
					if err := rows2.Scan(&d.ID, &d.RegistrationID, &d.DocType, &d.FilePath, &d.OriginalName, &d.CreatedAt); err != nil {
						continue
					}
					docs = append(docs, d)
				}
			}
		}
	}

	return response.JSON(c, fiber.StatusOK, "documents", docs)
}
