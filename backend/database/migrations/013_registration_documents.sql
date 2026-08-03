CREATE TABLE IF NOT EXISTS registration_documents (
  id CHAR(36) PRIMARY KEY,
  registration_id CHAR(36) NOT NULL,
  doc_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reg_docs_registration (registration_id),
  CONSTRAINT fk_reg_docs_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
