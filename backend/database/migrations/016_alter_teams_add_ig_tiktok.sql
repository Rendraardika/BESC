SET @schema_name = DATABASE();

-- Add leader_ig
SET @col = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN leader_ig VARCHAR(100) NOT NULL DEFAULT \'\' AFTER leader_kelas',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND COLUMN_NAME = 'leader_ig'
);
PREPARE stmt FROM @col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add leader_tiktok
SET @col = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN leader_tiktok VARCHAR(100) NOT NULL DEFAULT \'\' AFTER leader_ig',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND COLUMN_NAME = 'leader_tiktok'
);
PREPARE stmt FROM @col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add member1_ig
SET @col = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member1_ig VARCHAR(100) NOT NULL DEFAULT \'\' AFTER member1_kelas',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND COLUMN_NAME = 'member1_ig'
);
PREPARE stmt FROM @col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add member1_tiktok
SET @col = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member1_tiktok VARCHAR(100) NOT NULL DEFAULT \'\' AFTER member1_ig',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND COLUMN_NAME = 'member1_tiktok'
);
PREPARE stmt FROM @col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add member2_ig
SET @col = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member2_ig VARCHAR(100) NOT NULL DEFAULT \'\' AFTER member2_kelas',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND COLUMN_NAME = 'member2_ig'
);
PREPARE stmt FROM @col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add member2_tiktok
SET @col = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member2_tiktok VARCHAR(100) NOT NULL DEFAULT \'\' AFTER member2_ig',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND COLUMN_NAME = 'member2_tiktok'
);
PREPARE stmt FROM @col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
