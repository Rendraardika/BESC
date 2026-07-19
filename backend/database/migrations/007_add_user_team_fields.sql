SET @schema_name = DATABASE();

SET @add_team_name = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN team_name VARCHAR(150) NOT NULL DEFAULT ''''',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'team_name'
);
PREPARE stmt FROM @add_team_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_member1_name = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN member1_name VARCHAR(150) NOT NULL DEFAULT ''''',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'member1_name'
);
PREPARE stmt FROM @add_member1_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_member2_name = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN member2_name VARCHAR(150) NOT NULL DEFAULT ''''',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'member2_name'
);
PREPARE stmt FROM @add_member2_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
