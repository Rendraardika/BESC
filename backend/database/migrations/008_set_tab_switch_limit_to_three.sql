ALTER TABLE competitions
  MODIFY COLUMN tab_switch_limit INT NOT NULL DEFAULT 3;

UPDATE competitions
SET tab_switch_limit = 3
WHERE tab_switch_limit IS NULL OR tab_switch_limit > 3;
