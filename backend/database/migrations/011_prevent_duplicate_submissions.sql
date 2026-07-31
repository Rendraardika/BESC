DELIMITER //

CREATE PROCEDURE besc_check_duplicate_submissions_before_unique()
BEGIN
  IF EXISTS (
    SELECT 1
    FROM submissions
    GROUP BY user_id, competition_id
    HAVING COUNT(*) > 1
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'duplicate submissions exist; resolve duplicates before adding uq_submissions_user_competition';
  END IF;
END//

DELIMITER ;

CALL besc_check_duplicate_submissions_before_unique();
DROP PROCEDURE besc_check_duplicate_submissions_before_unique;

ALTER TABLE submissions
  ADD UNIQUE KEY uq_submissions_user_competition (user_id, competition_id);
