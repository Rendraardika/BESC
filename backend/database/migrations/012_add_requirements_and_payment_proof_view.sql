ALTER TABLE competitions
  ADD COLUMN participant_requirements TEXT NULL AFTER description;

ALTER TABLE payments
  ADD COLUMN proof_viewed_at DATETIME NULL AFTER validated_at,
  ADD COLUMN proof_viewed_by CHAR(36) NULL AFTER proof_viewed_at,
  ADD INDEX idx_payments_proof_viewed_by (proof_viewed_by),
  ADD CONSTRAINT fk_payments_proof_viewer FOREIGN KEY (proof_viewed_by) REFERENCES users(id) ON DELETE SET NULL;
