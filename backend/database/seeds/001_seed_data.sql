INSERT INTO users (id, name, email, password, role, phone, institution)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Platform Admin', 'admin@example.com', '$2a$10$pnjK/mzBpN2SqeF1pQTwpu0qB0t/nWNQ42cmKTKSNWEIuHc/5vpDq', 'admin', '0800000000', 'BESC'),
  ('22222222-2222-2222-2222-222222222222', 'Demo User', 'user@example.com', '$2a$10$pnjK/mzBpN2SqeF1pQTwpu0qB0t/nWNQ42cmKTKSNWEIuHc/5vpDq', 'user', '08123456789', 'Demo School')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  phone = VALUES(phone),
  institution = VALUES(institution);

INSERT INTO competitions (id, title, slug, description, banner, price, start_time, end_time, status)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'National Science Challenge',
  'national-science-challenge',
  'A sample online competition for science students.',
  '',
  150000,
  '2026-06-01 09:00:00',
  '2026-06-01 11:00:00',
  'published'
) ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO questions (id, competition_id, question, option_a, option_b, option_c, option_d, correct_answer, score)
VALUES
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333', 'What is the chemical symbol for water?', 'H2O', 'O2', 'CO2', 'NaCl', 'A', 10),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333333', 'Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Mercury', 'B', 10)
ON DUPLICATE KEY UPDATE question = VALUES(question);
