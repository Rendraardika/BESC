CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  institution VARCHAR(150) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS competitions (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  banner VARCHAR(255) NOT NULL DEFAULT '',
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_competitions_status (status),
  INDEX idx_competitions_time (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registrations (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  competition_id CHAR(36) NOT NULL,
  status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_registration_user_competition (user_id, competition_id),
  INDEX idx_registrations_status (status),
  CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_registrations_competition FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  registration_id CHAR(36) NOT NULL UNIQUE,
  proof_image VARCHAR(255) NOT NULL,
  payment_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  validated_by CHAR(36) NULL,
  validated_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_status (payment_status),
  CONSTRAINT fk_payments_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_validator FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questions (
  id CHAR(36) PRIMARY KEY,
  competition_id CHAR(36) NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
  score DECIMAL(8,2) NOT NULL DEFAULT 1,
  INDEX idx_questions_competition (competition_id),
  CONSTRAINT fk_questions_competition FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submissions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  competition_id CHAR(36) NOT NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  score DECIMAL(8,2) NOT NULL DEFAULT 0,
  status ENUM('started', 'submitted') NOT NULL DEFAULT 'started',
  violation_count INT NOT NULL DEFAULT 0,
  INDEX idx_submissions_user_competition (user_id, competition_id),
  INDEX idx_submissions_status (status),
  CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_submissions_competition FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS answers (
  id CHAR(36) PRIMARY KEY,
  submission_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  answer ENUM('A', 'B', 'C', 'D') NOT NULL,
  UNIQUE KEY uq_answers_submission_question (submission_id, question_id),
  CONSTRAINT fk_answers_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
