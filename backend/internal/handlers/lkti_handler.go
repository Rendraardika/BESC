package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"online-competition-platform/config"
	"online-competition-platform/internal/utils"
	"online-competition-platform/pkg/response"
)

const (
	lktiAbstractSubmitted  = "abstract_submitted"
	lktiAbstractPassed     = "abstract_passed"
	lktiAbstractRejected   = "abstract_rejected"
	lktiFullPaperSubmitted = "full_paper_submitted"
)

var lktiSubthemes = map[string]bool{
	"Bioenergy Genetics":        true,
	"Molecular Bioremediation":  true,
	"Microbial Bioenergy":       true,
	"Metabolic Engineering":     true,
	"Sustainable Biotechnology": true,
}

type LKTIHandler struct {
	db  *sql.DB
	cfg config.Config
}

func NewLKTIHandler(db *sql.DB, cfg config.Config) *LKTIHandler {
	return &LKTIHandler{db: db, cfg: cfg}
}

type lktiSubmissionInput struct {
	AbstractTitle string `json:"abstract_title"`
	Subtheme      string `json:"subtheme"`
}

func (h *LKTIHandler) CreateSubmission(c *fiber.Ctx) error {
	registrationID := c.Params("registration_id")
	var input lktiSubmissionInput
	if err := c.BodyParser(&input); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "data pengajuan tidak valid", nil)
	}
	input.AbstractTitle = strings.TrimSpace(input.AbstractTitle)
	input.Subtheme = strings.TrimSpace(input.Subtheme)
	if input.AbstractTitle == "" || !lktiSubthemes[input.Subtheme] {
		return response.Error(c, fiber.StatusBadRequest, "judul abstrak dan subtema LKTI wajib valid", nil)
	}

	var teamID sql.NullString
	var isLKTI bool
	err := h.db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM registrations r
			JOIN competitions c ON c.id = r.competition_id
			WHERE r.id = ? AND r.user_id = ?
			AND (LOWER(c.category) LIKE '%lkti%' OR LOWER(c.title) LIKE '%lkti%' OR LOWER(c.title) LIKE '%karya tulis%')
		), (SELECT id FROM teams WHERE user_id = ? AND LOWER(category) = 'lkti' ORDER BY created_at DESC LIMIT 1)
	`, registrationID, userID(c), userID(c)).Scan(&isLKTI, &teamID)
	if err != nil || !isLKTI {
		return response.Error(c, fiber.StatusForbidden, "pendaftaran LKTI tidak ditemukan", nil)
	}
	var abstractCount int
	if err := h.db.QueryRow(`SELECT COUNT(*) FROM registration_documents WHERE registration_id = ? AND doc_type IN ('abstrak','abstract')`, registrationID).Scan(&abstractCount); err != nil {
		return handleError(c, err)
	}
	if abstractCount == 0 {
		return response.Error(c, fiber.StatusConflict, "unggah abstrak PDF terlebih dahulu", nil)
	}

	id := uuid.NewString()
	_, err = h.db.Exec(`
		INSERT INTO lkti_submissions (id, registration_id, team_id, abstract_title, subtheme)
		VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE team_id=VALUES(team_id), abstract_title=VALUES(abstract_title), subtheme=VALUES(subtheme)
	`, id, registrationID, teamID, input.AbstractTitle, input.Subtheme)
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "pengajuan abstrak LKTI tersimpan", fiber.Map{"id": id})
}

type lktiItem struct {
	ID                    string  `json:"id"`
	RegistrationID        string  `json:"registration_id"`
	CompetitionTitle      string  `json:"competition_title"`
	ParticipantName       string  `json:"participant_name"`
	ParticipantEmail      string  `json:"participant_email"`
	TeamName              string  `json:"team_name"`
	LeaderName            string  `json:"leader_name"`
	Institution           string  `json:"institution"`
	AbstractTitle         string  `json:"abstract_title"`
	Subtheme              string  `json:"subtheme"`
	Status                string  `json:"status"`
	PaymentStatus         string  `json:"payment_status"`
	WorkTitle             string  `json:"work_title"`
	WorkType              string  `json:"work_type"`
	AbstractDocumentID    *string `json:"abstract_document_id"`
	AbstractOriginalName  *string `json:"abstract_original_name"`
	FullPaperDocumentID   *string `json:"full_paper_document_id"`
	FullPaperOriginalName *string `json:"full_paper_original_name"`
	AbstractSubmittedAt   string  `json:"abstract_submitted_at"`
	FullPaperSubmittedAt  *string `json:"full_paper_submitted_at"`
}

const lktiSelect = `
	SELECT ls.id, ls.registration_id, c.title, u.name, u.email,
		COALESCE(t.name,''), COALESCE(t.leader_name,u.name), COALESCE(t.institution,u.institution,''),
		ls.abstract_title, ls.subtheme, ls.status, COALESCE(p.payment_status,'pending'),
		COALESCE(ls.work_title,''), COALESCE(ls.work_type,''),
		(SELECT id FROM registration_documents WHERE registration_id=ls.registration_id AND doc_type IN ('abstrak','abstract') ORDER BY created_at DESC LIMIT 1),
		(SELECT original_name FROM registration_documents WHERE registration_id=ls.registration_id AND doc_type IN ('abstrak','abstract') ORDER BY created_at DESC LIMIT 1),
		(SELECT id FROM registration_documents WHERE registration_id=ls.registration_id AND doc_type='full_paper' ORDER BY created_at DESC LIMIT 1),
		(SELECT original_name FROM registration_documents WHERE registration_id=ls.registration_id AND doc_type='full_paper' ORDER BY created_at DESC LIMIT 1),
		DATE_FORMAT(ls.abstract_submitted_at, '%Y-%m-%dT%H:%i:%s'),
		CASE WHEN ls.full_paper_submitted_at IS NULL THEN NULL ELSE DATE_FORMAT(ls.full_paper_submitted_at, '%Y-%m-%dT%H:%i:%s') END
	FROM lkti_submissions ls
	JOIN registrations r ON r.id=ls.registration_id
	JOIN competitions c ON c.id=r.competition_id
	JOIN users u ON u.id=r.user_id
	LEFT JOIN teams t ON t.id=ls.team_id
	LEFT JOIN payments p ON p.registration_id=r.id
`

func scanLKTI(row interface{ Scan(...interface{}) error }) (*lktiItem, error) {
	var item lktiItem
	err := row.Scan(&item.ID, &item.RegistrationID, &item.CompetitionTitle, &item.ParticipantName, &item.ParticipantEmail,
		&item.TeamName, &item.LeaderName, &item.Institution, &item.AbstractTitle, &item.Subtheme, &item.Status,
		&item.PaymentStatus, &item.WorkTitle, &item.WorkType, &item.AbstractDocumentID, &item.AbstractOriginalName,
		&item.FullPaperDocumentID, &item.FullPaperOriginalName, &item.AbstractSubmittedAt, &item.FullPaperSubmittedAt)
	return &item, err
}

func (h *LKTIHandler) MySubmission(c *fiber.Ctx) error {
	item, err := scanLKTI(h.db.QueryRow(lktiSelect+` WHERE r.user_id=? ORDER BY ls.created_at DESC LIMIT 1`, userID(c)))
	if errors.Is(err, sql.ErrNoRows) {
		return response.JSON(c, fiber.StatusOK, "belum ada pengajuan LKTI", nil)
	}
	if err != nil {
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusOK, "pengajuan LKTI", item)
}

func (h *LKTIHandler) AdminList(c *fiber.Ctx) error {
	rows, err := h.db.Query(lktiSelect + ` ORDER BY ls.created_at DESC`)
	if err != nil {
		return handleError(c, err)
	}
	defer rows.Close()
	items := make([]lktiItem, 0)
	for rows.Next() {
		item, scanErr := scanLKTI(rows)
		if scanErr != nil {
			return handleError(c, scanErr)
		}
		items = append(items, *item)
	}
	return response.JSON(c, fiber.StatusOK, "daftar karya LKTI", items)
}

func (h *LKTIHandler) UpdateStatus(c *fiber.Ctx) error {
	var input struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&input); err != nil || (input.Status != lktiAbstractPassed && input.Status != lktiAbstractRejected) {
		return response.Error(c, fiber.StatusBadRequest, "status seleksi abstrak tidak valid", nil)
	}
	var email, name, title, paymentStatus string
	err := h.db.QueryRow(`SELECT u.email,u.name,c.title,COALESCE(p.payment_status,'pending') FROM lkti_submissions ls JOIN registrations r ON r.id=ls.registration_id JOIN users u ON u.id=r.user_id JOIN competitions c ON c.id=r.competition_id LEFT JOIN payments p ON p.registration_id=r.id WHERE ls.id=?`, c.Params("id")).Scan(&email, &name, &title, &paymentStatus)
	if errors.Is(err, sql.ErrNoRows) {
		return handleError(c, utils.ErrNotFound)
	}
	if err != nil {
		return handleError(c, err)
	}
	if input.Status == lktiAbstractPassed && paymentStatus != "verified" {
		return response.Error(c, fiber.StatusConflict, "pembayaran harus terverifikasi sebelum abstrak diloloskan", nil)
	}
	result, err := h.db.Exec(`UPDATE lkti_submissions SET status=?, reviewed_by=?, reviewed_at=NOW() WHERE id=? AND status IN ('abstract_submitted','abstract_passed','abstract_rejected')`, input.Status, userID(c), c.Params("id"))
	if err != nil {
		return handleError(c, err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return response.Error(c, fiber.StatusConflict, "full paper sudah dikirim dan status tidak dapat diubah", nil)
	}
	go func() {
		if err := h.sendStatusEmail(email, name, title, input.Status); err != nil {
			log.Printf("LKTI status updated but email failed: %v", err)
		}
	}()
	return response.JSON(c, fiber.StatusOK, "status seleksi abstrak diperbarui", nil)
}

func (h *LKTIHandler) UploadFullPaper(c *fiber.Ctx) error {
	workTitle := strings.TrimSpace(c.FormValue("work_title"))
	workType := strings.TrimSpace(c.FormValue("work_type"))
	subtheme := strings.TrimSpace(c.FormValue("subtheme"))
	confirmed := c.FormValue("confirmed") == "true"
	if workTitle == "" || !lktiSubthemes[subtheme] || (workType != "Original Article" && workType != "Review Article") || !confirmed {
		return response.Error(c, fiber.StatusBadRequest, "lengkapi data karya dan pernyataan konfirmasi", nil)
	}
	file, err := c.FormFile("full_paper")
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "full paper PDF wajib diunggah", nil)
	}
	ext, err := validatePDFUpload(file)
	if err != nil {
		return uploadValidationResponse(c, err)
	}
	var registrationID, status string
	err = h.db.QueryRow(`SELECT ls.registration_id,ls.status FROM lkti_submissions ls JOIN registrations r ON r.id=ls.registration_id WHERE ls.id=? AND r.user_id=?`, c.Params("id"), userID(c)).Scan(&registrationID, &status)
	if errors.Is(err, sql.ErrNoRows) {
		return handleError(c, utils.ErrForbidden)
	}
	if err != nil {
		return handleError(c, err)
	}
	if status != lktiAbstractPassed {
		return response.Error(c, fiber.StatusConflict, "full paper hanya dapat dikirim setelah abstrak dinyatakan lolos", nil)
	}
	storageKey := filepath.ToSlash(filepath.Join("registrations", registrationID, fmt.Sprintf("doc_%s_full_paper%s", uuid.NewString(), ext)))
	diskPath := filepath.Join(h.cfg.UploadDir, "private", filepath.FromSlash(storageKey))
	if err := os.MkdirAll(filepath.Dir(diskPath), 0750); err != nil {
		return handleError(c, err)
	}
	if err := c.SaveFile(file, diskPath); err != nil {
		return handleError(c, err)
	}
	tx, err := h.db.Begin()
	if err != nil {
		_ = os.Remove(diskPath)
		return handleError(c, err)
	}
	defer tx.Rollback()
	if _, err = tx.Exec(`INSERT INTO registration_documents (id,registration_id,doc_type,file_path,original_name) VALUES (?,?,?,?,?)`, uuid.NewString(), registrationID, "full_paper", storageKey, filepath.Base(file.Filename)); err != nil {
		_ = os.Remove(diskPath)
		return handleError(c, err)
	}
	if _, err = tx.Exec(`UPDATE lkti_submissions SET work_title=?,work_type=?,subtheme=?,status=?,full_paper_submitted_at=NOW(),confirmation_at=NOW() WHERE id=?`, workTitle, workType, subtheme, lktiFullPaperSubmitted, c.Params("id")); err != nil {
		_ = os.Remove(diskPath)
		return handleError(c, err)
	}
	if err := tx.Commit(); err != nil {
		_ = os.Remove(diskPath)
		return handleError(c, err)
	}
	return response.JSON(c, fiber.StatusCreated, "full paper berhasil dikirim", nil)
}

func (h *LKTIHandler) sendStatusEmail(recipient, name, competition, status string) error {
	if h.cfg.SMTPHost == "" || h.cfg.SMTPUser == "" || h.cfg.SMTPPass == "" {
		return fmt.Errorf("smtp is not configured")
	}
	passed := status == lktiAbstractPassed
	subject := "Hasil Seleksi Abstrak LKTI BESC"
	message := fmt.Sprintf("Halo %s,\r\n\r\nTerima kasih telah mengikuti seleksi abstrak %s. Mohon maaf, abstrak tim kamu belum dapat melanjutkan ke tahap full paper.\r\n\r\nTerima kasih,\r\nTim BESC", name, competition)
	if passed {
		subject = "Selamat, Abstrak LKTI Kamu Lolos"
		message = fmt.Sprintf("Halo %s,\r\n\r\nSelamat! Abstrak tim kamu pada %s dinyatakan lolos. Silakan masuk ke akun BESC dan unggah full paper final melalui halaman Status Karya LKTI.\r\n\r\nTerima kasih,\r\nTim BESC", name, competition)
	}
	from := h.cfg.MailFrom
	if from == "" {
		from = h.cfg.SMTPUser
	}
	body := []byte("From: " + from + "\r\nTo: " + recipient + "\r\nSubject: " + subject + "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" + message)
	auth := smtp.PlainAuth("", h.cfg.SMTPUser, strings.ReplaceAll(strings.TrimSpace(h.cfg.SMTPPass), " ", ""), h.cfg.SMTPHost)
	return smtp.SendMail(h.cfg.SMTPHost+":"+h.cfg.SMTPPort, auth, h.cfg.SMTPUser, []string{recipient}, body)
}
