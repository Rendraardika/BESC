ALTER TABLE questions
  ADD COLUMN option_e TEXT NULL AFTER option_d,
  ADD COLUMN wrong_score DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER score,
  MODIFY COLUMN correct_answer ENUM('A', 'B', 'C', 'D', 'E') NOT NULL;

UPDATE questions
SET option_e = ''
WHERE option_e IS NULL;

ALTER TABLE questions
  MODIFY COLUMN option_e TEXT NOT NULL;

ALTER TABLE answers
  MODIFY COLUMN answer ENUM('A', 'B', 'C', 'D', 'E') NOT NULL;
