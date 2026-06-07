package repositories

import (
	"database/sql"
	"errors"
	"time"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

type RegistrationRepository interface {
	Create(registration *entities.Registration) error
	FindByUserAndCompetition(userID, competitionID string) (*entities.Registration, error)
	FindByID(id string) (*entities.Registration, error)
	ListByUser(userID string, page, limit int) ([]entities.RegistrationDetail, int, error)
	UpdateStatusTx(tx *sql.Tx, registrationID, status string) error
}

type PaymentRepository interface {
	Upsert(payment *entities.Payment) error
	FindByRegistrationID(registrationID string) (*entities.Payment, error)
	UpdateStatus(paymentID, status, adminID string) error
	NotificationDetails(paymentID string) (string, string, error)
}

func (r *paymentRepository) NotificationDetails(paymentID string) (string, string, error) {
	var email, competitionTitle string
	err := r.db.QueryRow(`
		SELECT u.email, c.title
		FROM payments p
		JOIN registrations r ON r.id = p.registration_id
		JOIN users u ON u.id = r.user_id
		JOIN competitions c ON c.id = r.competition_id
		WHERE p.id = ?`, paymentID).Scan(&email, &competitionTitle)
	return email, competitionTitle, err
}

type registrationRepository struct{ db *sql.DB }
type paymentRepository struct{ db *sql.DB }

func NewRegistrationRepository(db *sql.DB) RegistrationRepository {
	return &registrationRepository{db: db}
}

func NewPaymentRepository(db *sql.DB) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *registrationRepository) Create(registration *entities.Registration) error {
	_, err := r.db.Exec(`INSERT INTO registrations (id, user_id, competition_id, status) VALUES (?, ?, ?, ?)`,
		registration.ID, registration.UserID, registration.CompetitionID, registration.Status)
	return err
}

func (r *registrationRepository) FindByUserAndCompetition(userID, competitionID string) (*entities.Registration, error) {
	return scanRegistration(r.db.QueryRow(`SELECT id, user_id, competition_id, status, created_at FROM registrations WHERE user_id = ? AND competition_id = ?`, userID, competitionID))
}

func (r *registrationRepository) FindByID(id string) (*entities.Registration, error) {
	return scanRegistration(r.db.QueryRow(`SELECT id, user_id, competition_id, status, created_at FROM registrations WHERE id = ?`, id))
}

func (r *registrationRepository) ListByUser(userID string, page, limit int) ([]entities.RegistrationDetail, int, error) {
	offset := (page - 1) * limit
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM registrations WHERE user_id = ?`, userID).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(`
		SELECT r.id, r.user_id, r.competition_id, r.status, r.created_at, c.title, c.slug, COALESCE(p.payment_status, ''), COALESCE(p.proof_image, '')
		FROM registrations r
		JOIN competitions c ON c.id = r.competition_id
		LEFT JOIN payments p ON p.registration_id = r.id
		WHERE r.user_id = ?
		ORDER BY r.created_at DESC
		LIMIT ? OFFSET ?`, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []entities.RegistrationDetail{}
	for rows.Next() {
		var item entities.RegistrationDetail
		if err := rows.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.Status, &item.CreatedAt, &item.CompetitionTitle, &item.CompetitionSlug, &item.PaymentStatus, &item.ProofImage); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (r *registrationRepository) UpdateStatusTx(tx *sql.Tx, registrationID, status string) error {
	result, err := tx.Exec(`UPDATE registrations SET status = ? WHERE id = ?`, status, registrationID)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *paymentRepository) Upsert(payment *entities.Payment) error {
	_, err := r.db.Exec(`
		INSERT INTO payments (id, registration_id, proof_image, payment_status)
		VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE proof_image = VALUES(proof_image), payment_status = VALUES(payment_status), validated_by = NULL, validated_at = NULL`,
		payment.ID, payment.RegistrationID, payment.ProofImage, payment.PaymentStatus)
	return err
}

func (r *paymentRepository) FindByRegistrationID(registrationID string) (*entities.Payment, error) {
	return scanPayment(r.db.QueryRow(`SELECT id, registration_id, proof_image, payment_status, validated_by, validated_at, created_at FROM payments WHERE registration_id = ?`, registrationID))
}

func (r *paymentRepository) UpdateStatus(paymentID, status, adminID string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var registrationID string
	if err := tx.QueryRow(`SELECT registration_id FROM payments WHERE id = ? FOR UPDATE`, paymentID).Scan(&registrationID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return utils.ErrNotFound
		}
		return err
	}

	now := time.Now()
	result, err := tx.Exec(`UPDATE payments SET payment_status = ?, validated_by = ?, validated_at = ? WHERE id = ?`, status, adminID, now, paymentID)
	if err != nil {
		return err
	}
	if err := rowsAffected(result); err != nil {
		return err
	}

	regStatus := entities.RegistrationRejected
	if status == entities.PaymentVerified {
		regStatus = entities.RegistrationVerified
	}
	if _, err := tx.Exec(`UPDATE registrations SET status = ? WHERE id = ?`, regStatus, registrationID); err != nil {
		return err
	}

	return tx.Commit()
}

func scanRegistration(row *sql.Row) (*entities.Registration, error) {
	var item entities.Registration
	if err := row.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.Status, &item.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return &item, nil
}

func scanPayment(row *sql.Row) (*entities.Payment, error) {
	var item entities.Payment
	if err := row.Scan(&item.ID, &item.RegistrationID, &item.ProofImage, &item.PaymentStatus, &item.ValidatedBy, &item.ValidatedAt, &item.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return &item, nil
}
