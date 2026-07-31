SET @schema_name = DATABASE();

SET @add_violation_count = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE submissions ADD COLUMN violation_count INT NOT NULL DEFAULT 0',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'submissions'
    AND COLUMN_NAME = 'violation_count'
);
PREPARE stmt FROM @add_violation_count;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS proctoring_events (
  id CHAR(36) PRIMARY KEY,
  submission_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  event_type ENUM('page_leave', 'tab_switch', 'fullscreen_exit', 'camera_off', 'camera_on', 'copy_attempt', 'right_click', 'screenshot_attempt', 'devtools_attempt') NOT NULL,
  metadata TEXT NULL,
  ip_address VARCHAR(45) NOT NULL DEFAULT '',
  user_agent VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_proctoring_events_submission (submission_id, created_at),
  INDEX idx_proctoring_events_user (user_id),
  INDEX idx_proctoring_events_type (event_type),
  CONSTRAINT fk_proctoring_events_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_proctoring_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proctoring_snapshots (
  id CHAR(36) PRIMARY KEY,
  submission_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  captured_at DATETIME NOT NULL,
  INDEX idx_proctoring_snapshots_submission (submission_id, captured_at),
  INDEX idx_proctoring_snapshots_user (user_id),
  CONSTRAINT fk_proctoring_snapshots_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_proctoring_snapshots_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
