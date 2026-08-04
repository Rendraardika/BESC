SET @schema_name = DATABASE();

SET @add_user_id = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN user_id CHAR(36) NULL AFTER id',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'user_id'
);
PREPARE stmt FROM @add_user_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_leader_nisn = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN leader_nisn VARCHAR(30) NOT NULL DEFAULT \'\' AFTER leader_phone',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'leader_nisn'
);
PREPARE stmt FROM @add_leader_nisn;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_leader_kelas = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN leader_kelas VARCHAR(10) NOT NULL DEFAULT \'\' AFTER leader_nisn',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'leader_kelas'
);
PREPARE stmt FROM @add_leader_kelas;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_member1_nisn = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member1_nisn VARCHAR(30) NOT NULL DEFAULT \'\' AFTER member1_email',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'member1_nisn'
);
PREPARE stmt FROM @add_member1_nisn;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_member1_kelas = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member1_kelas VARCHAR(10) NOT NULL DEFAULT \'\' AFTER member1_nisn',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'member1_kelas'
);
PREPARE stmt FROM @add_member1_kelas;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_member2_nisn = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member2_nisn VARCHAR(30) NOT NULL DEFAULT \'\' AFTER member2_email',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'member2_nisn'
);
PREPARE stmt FROM @add_member2_nisn;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_member2_kelas = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN member2_kelas VARCHAR(10) NOT NULL DEFAULT \'\' AFTER member2_nisn',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'member2_kelas'
);
PREPARE stmt FROM @add_member2_kelas;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_province = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN province VARCHAR(100) NOT NULL DEFAULT \'\' AFTER institution',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'province'
);
PREPARE stmt FROM @add_province;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_city = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN city VARCHAR(100) NOT NULL DEFAULT \'\' AFTER province',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'city'
);
PREPARE stmt FROM @add_city;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_address = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN address VARCHAR(255) NOT NULL DEFAULT \'\' AFTER city',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'address'
);
PREPARE stmt FROM @add_address;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_guardian_name = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN guardian_name VARCHAR(150) NOT NULL DEFAULT \'\' AFTER address',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'guardian_name'
);
PREPARE stmt FROM @add_guardian_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_guardian_hp = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN guardian_hp VARCHAR(30) NOT NULL DEFAULT \'\' AFTER guardian_name',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'guardian_hp'
);
PREPARE stmt FROM @add_guardian_hp;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_guardian_email = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teams ADD COLUMN guardian_email VARCHAR(150) NOT NULL DEFAULT \'\' AFTER guardian_hp',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'teams'
    AND COLUMN_NAME = 'guardian_email'
);
PREPARE stmt FROM @add_guardian_email;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_user_id_fk = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND CONSTRAINT_NAME = 'fk_teams_user') = 0,
    'ALTER TABLE teams ADD CONSTRAINT fk_teams_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @add_user_id_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_user_id_idx = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'teams' AND INDEX_NAME = 'idx_teams_user_id') = 0,
    'ALTER TABLE teams ADD INDEX idx_teams_user_id (user_id)',
    'SELECT 1'
  )
);
PREPARE stmt FROM @add_user_id_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
