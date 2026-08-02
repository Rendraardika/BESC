package database

import (
	"database/sql"
	"fmt"
)

func EnsureLatestSchema(db *sql.DB, schemaName string) error {
	if err := ensureColumn(db, schemaName, "competitions", "participant_requirements", "ALTER TABLE competitions ADD COLUMN participant_requirements TEXT NULL AFTER description"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "payments", "proof_viewed_at", "ALTER TABLE payments ADD COLUMN proof_viewed_at DATETIME NULL AFTER validated_at"); err != nil {
		return err
	}
	if err := ensureColumn(db, schemaName, "payments", "proof_viewed_by", "ALTER TABLE payments ADD COLUMN proof_viewed_by CHAR(36) NULL AFTER proof_viewed_at"); err != nil {
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
