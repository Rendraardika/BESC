package repositories

import (
	"database/sql"

	"online-competition-platform/internal/entities"
)

type ProctoringRepository interface {
	CreateEvent(event *entities.ProctoringEvent, countAsViolation bool) error
	CreateSnapshot(snapshot *entities.ProctoringSnapshot) error
	ListEvents(submissionID string, page, limit int) ([]entities.ProctoringEvent, int, error)
	ListSnapshots(submissionID string, page, limit int) ([]entities.ProctoringSnapshot, int, error)
	Summary(submissionID string) (*entities.ProctoringSummary, error)
}

type proctoringRepository struct {
	db *sql.DB
}

func NewProctoringRepository(db *sql.DB) ProctoringRepository {
	return &proctoringRepository{db: db}
}

func (r *proctoringRepository) CreateEvent(event *entities.ProctoringEvent, countAsViolation bool) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
		INSERT INTO proctoring_events (id, submission_id, user_id, event_type, metadata, ip_address, user_agent)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		event.ID, event.SubmissionID, event.UserID, event.EventType, event.Metadata, event.IPAddress, event.UserAgent)
	if err != nil {
		return err
	}

	if countAsViolation {
		if _, err := tx.Exec(`UPDATE submissions SET violation_count = violation_count + 1 WHERE id = ?`, event.SubmissionID); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *proctoringRepository) CreateSnapshot(snapshot *entities.ProctoringSnapshot) error {
	_, err := r.db.Exec(`
		INSERT INTO proctoring_snapshots (id, submission_id, user_id, image_path, captured_at)
		VALUES (?, ?, ?, ?, ?)`,
		snapshot.ID, snapshot.SubmissionID, snapshot.UserID, snapshot.ImagePath, snapshot.CapturedAt)
	return err
}

func (r *proctoringRepository) ListEvents(submissionID string, page, limit int) ([]entities.ProctoringEvent, int, error) {
	offset := (page - 1) * limit
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM proctoring_events WHERE submission_id = ?`, submissionID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(`
		SELECT id, submission_id, user_id, event_type, metadata, ip_address, user_agent, created_at
		FROM proctoring_events
		WHERE submission_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?`, submissionID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []entities.ProctoringEvent{}
	for rows.Next() {
		var item entities.ProctoringEvent
		if err := rows.Scan(&item.ID, &item.SubmissionID, &item.UserID, &item.EventType, &item.Metadata, &item.IPAddress, &item.UserAgent, &item.CreatedAt); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (r *proctoringRepository) ListSnapshots(submissionID string, page, limit int) ([]entities.ProctoringSnapshot, int, error) {
	offset := (page - 1) * limit
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM proctoring_snapshots WHERE submission_id = ?`, submissionID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(`
		SELECT id, submission_id, user_id, image_path, captured_at
		FROM proctoring_snapshots
		WHERE submission_id = ?
		ORDER BY captured_at DESC
		LIMIT ? OFFSET ?`, submissionID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []entities.ProctoringSnapshot{}
	for rows.Next() {
		var item entities.ProctoringSnapshot
		if err := rows.Scan(&item.ID, &item.SubmissionID, &item.UserID, &item.ImagePath, &item.CapturedAt); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (r *proctoringRepository) Summary(submissionID string) (*entities.ProctoringSummary, error) {
	summary := &entities.ProctoringSummary{SubmissionID: submissionID}
	if err := r.db.QueryRow(`SELECT violation_count FROM submissions WHERE id = ?`, submissionID).Scan(&summary.ViolationCount); err != nil {
		return nil, err
	}
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM proctoring_events WHERE submission_id = ?`, submissionID).Scan(&summary.EventCount); err != nil {
		return nil, err
	}
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM proctoring_snapshots WHERE submission_id = ?`, submissionID).Scan(&summary.SnapshotCount); err != nil {
		return nil, err
	}
	return summary, nil
}
