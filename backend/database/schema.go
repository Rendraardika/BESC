package database

import (
	"database/sql"
	"fmt"
	"strings"
)

func EnsureLatestSchema(db *sql.DB, schemaName string) error {
	if err := ensureRegistrationStatusValues(db, schemaName); err != nil {
		return err
	}
	if err := ensureTable(db, schemaName, "registration_documents", `
		CREATE TABLE registration_documents (
			id CHAR(36) PRIMARY KEY,
			registration_id CHAR(36) NOT NULL,
			doc_type VARCHAR(100) NOT NULL,
			file_path TEXT NOT NULL,
			original_name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			INDEX idx_registration_documents_registration_id (registration_id),
			CONSTRAINT fk_registration_documents_registration
				FOREIGN KEY (registration_id) REFERENCES registrations(id)
				ON DELETE CASCADE
		)
	`); err != nil {
		return err
	}
	if err := ensureTable(db, schemaName, "lkti_submissions", `
		CREATE TABLE lkti_submissions (
			id CHAR(36) PRIMARY KEY,
			registration_id CHAR(36) NOT NULL,
			team_id CHAR(36) NULL,
			abstract_title VARCHAR(255) NOT NULL,
			subtheme VARCHAR(150) NOT NULL,
			status VARCHAR(40) NOT NULL DEFAULT 'abstract_submitted',
			work_title VARCHAR(255) NULL,
			work_type VARCHAR(40) NULL,
			abstract_submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			reviewed_by CHAR(36) NULL,
			reviewed_at DATETIME NULL,
			full_paper_submitted_at DATETIME NULL,
			confirmation_at DATETIME NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			UNIQUE KEY uq_lkti_submissions_registration (registration_id),
			INDEX idx_lkti_submissions_status (status),
			INDEX idx_lkti_submissions_subtheme (subtheme),
			INDEX idx_lkti_submissions_team (team_id),
			INDEX idx_lkti_submissions_reviewer (reviewed_by)
		)
	`); err != nil {
		return err
	}
	if _, err := db.Exec(`
		INSERT INTO lkti_submissions (id, registration_id, team_id, abstract_title, subtheme)
		SELECT UUID(), r.id, t.id,
			COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(t.notes, 'Judul:', -1), '|', 1)), ''), 'Pengajuan LKTI'),
			COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(t.notes, 'Subtema:', -1)), ''), 'Belum ditentukan')
		FROM registrations r
		JOIN competitions c ON c.id = r.competition_id
		LEFT JOIN teams t ON t.id = (
			SELECT t2.id FROM teams t2 WHERE t2.user_id = r.user_id AND LOWER(t2.category) = 'lkti' ORDER BY t2.created_at DESC LIMIT 1
		)
		WHERE (LOWER(c.category) LIKE '%lkti%' OR LOWER(c.title) LIKE '%lkti%' OR LOWER(c.title) LIKE '%karya tulis%')
		AND EXISTS (SELECT 1 FROM registration_documents rd WHERE rd.registration_id = r.id AND rd.doc_type IN ('abstrak','abstract'))
		AND NOT EXISTS (SELECT 1 FROM lkti_submissions ls WHERE ls.registration_id = r.id)
	`); err != nil {
		return fmt.Errorf("backfill legacy LKTI submissions: %w", err)
	}
	if err := ensureColumn(db, schemaName, "competitions", "participant_requirements", "ALTER TABLE competitions ADD COLUMN participant_requirements TEXT NULL AFTER description"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "competitions", "semifinal_start_time", "ALTER TABLE competitions ADD COLUMN semifinal_start_time DATETIME NULL AFTER end_time"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "competitions", "semifinal_end_time", "ALTER TABLE competitions ADD COLUMN semifinal_end_time DATETIME NULL AFTER semifinal_start_time"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "payments", "proof_viewed_at", "ALTER TABLE payments ADD COLUMN proof_viewed_at DATETIME NULL AFTER validated_at"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "payments", "proof_viewed_by", "ALTER TABLE payments ADD COLUMN proof_viewed_by CHAR(36) NULL AFTER proof_viewed_at"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "questions", "round", "ALTER TABLE questions ADD COLUMN round VARCHAR(30) NOT NULL DEFAULT 'preliminary' AFTER competition_id"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "submissions", "round", "ALTER TABLE submissions ADD COLUMN round VARCHAR(30) NOT NULL DEFAULT 'preliminary' AFTER competition_id"); err != nil {
		return err
	}
	if err := dropIndexIfExists(db, schemaName, "submissions", "uq_submissions_user_competition", "ALTER TABLE submissions DROP INDEX uq_submissions_user_competition"); err != nil {
		return err
	}
	if err := ensureIndex(db, schemaName, "questions", "idx_questions_competition_round", "ALTER TABLE questions ADD INDEX idx_questions_competition_round (competition_id, round)"); err != nil {
		return err
	}
	if err := ensureIndex(db, schemaName, "submissions", "uq_submissions_user_competition_round", "ALTER TABLE submissions ADD UNIQUE KEY uq_submissions_user_competition_round (user_id, competition_id, round)"); err != nil {
		return err
	}
	if err := ensureIndex(db, schemaName, "payments", "idx_payments_proof_viewed_by", "ALTER TABLE payments ADD INDEX idx_payments_proof_viewed_by (proof_viewed_by)"); err != nil {
		return err
	}
	if err := ensureForeignKey(db, schemaName, "payments", "fk_payments_proof_viewer", "ALTER TABLE payments ADD CONSTRAINT fk_payments_proof_viewer FOREIGN KEY (proof_viewed_by) REFERENCES users(id) ON DELETE SET NULL"); err != nil {
		return err
	}
	return nil
}

func ensureRegistrationStatusValues(db *sql.DB, schemaName string) error {
	var columnType string
	if err := db.QueryRow(`
		SELECT COLUMN_TYPE
		FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'status'
	`, schemaName).Scan(&columnType); err != nil {
		return fmt.Errorf("check registrations.status: %w", err)
	}

	required := []string{
		"pending", "verified", "rejected", "semifinalist", "finalist",
		"eliminated", "not_finalist", "not_winner", "winner_1", "winner_2", "winner_3",
	}
	for _, status := range required {
		if !strings.Contains(columnType, "'"+status+"'") {
			_, err := db.Exec(`ALTER TABLE registrations MODIFY COLUMN status ENUM('pending', 'verified', 'rejected', 'semifinalist', 'finalist', 'eliminated', 'not_finalist', 'not_winner', 'winner_1', 'winner_2', 'winner_3') NOT NULL DEFAULT 'pending'`)
			if err != nil {
				return fmt.Errorf("expand registrations.status values: %w", err)
			}
			return nil
		}
	}
	return nil
}

func dropIndexIfExists(db *sql.DB, schemaName, tableName, indexName, alterSQL string) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.STATISTICS
		WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?
	`, schemaName, tableName, indexName).Scan(&count); err != nil {
		return fmt.Errorf("check index %s.%s: %w", tableName, indexName, err)
	}
	if count == 0 {
		return nil
	}
	if _, err := db.Exec(alterSQL); err != nil {
		return fmt.Errorf("drop index %s.%s: %w", tableName, indexName, err)
	}
	return nil
}

func ensureTable(db *sql.DB, schemaName, tableName, createSQL string) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.TABLES
		WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
	`, schemaName, tableName).Scan(&count); err != nil {
		return fmt.Errorf("check table %s: %w", tableName, err)
	}
	if count > 0 {
		return nil
	}
	if _, err := db.Exec(createSQL); err != nil {
		return fmt.Errorf("create table %s: %w", tableName, err)
	}
	return nil
}

func ensureColumn(db *sql.DB, schemaName, tableName, columnName, alterSQL string) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
	`, schemaName, tableName, columnName).Scan(&count); err != nil {
		return fmt.Errorf("check column %s.%s: %w", tableName, columnName, err)
	}
	if count > 0 {
		return nil
	}
	if _, err := db.Exec(alterSQL); err != nil {
		return fmt.Errorf("add column %s.%s: %w", tableName, columnName, err)
	}
	return nil
}

func ensureIndex(db *sql.DB, schemaName, tableName, indexName, alterSQL string) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.STATISTICS
		WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?
	`, schemaName, tableName, indexName).Scan(&count); err != nil {
		return fmt.Errorf("check index %s.%s: %w", tableName, indexName, err)
	}
	if count > 0 {
		return nil
	}
	if _, err := db.Exec(alterSQL); err != nil {
		return fmt.Errorf("add index %s.%s: %w", tableName, indexName, err)
	}
	return nil
}

func ensureForeignKey(db *sql.DB, schemaName, tableName, constraintName, alterSQL string) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.TABLE_CONSTRAINTS
		WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?
	`, schemaName, tableName, constraintName).Scan(&count); err != nil {
		return fmt.Errorf("check foreign key %s.%s: %w", tableName, constraintName, err)
	}
	if count > 0 {
		return nil
	}
	if _, err := db.Exec(alterSQL); err != nil {
		return fmt.Errorf("add foreign key %s.%s: %w", tableName, constraintName, err)
	}
	return nil
}
