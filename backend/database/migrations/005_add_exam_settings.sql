ALTER TABLE competitions
  ADD COLUMN duration_minutes INT NOT NULL DEFAULT 60,
  ADD COLUMN tab_switch_limit INT NOT NULL DEFAULT 5;
