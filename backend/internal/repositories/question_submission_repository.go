package repositories

import (
	"database/sql"
	"errors"
	"time"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

type QuestionRepository interface {
	Create(question *entities.Question) error
	Update(question *entities.Question) error
	Delete(id string) error
	FindByID(id string) (*entities.Question, error)
	ListByCompetition(competitionID string, includeAnswer bool) ([]entities.Question, error)
}

type SubmissionRepository interface {
	Start(submission *entities.Submission) error
	FindByID(id string) (*entities.Submission, error)
	FindActive(userID, competitionID string) (*entities.Submission, error)
	Submit(submissionID string, answers []entities.Answer, score float64) error
	List(page, limit int) ([]entities.Submission, int, error)
	ListDetails(page, limit int) ([]entities.SubmissionDetail, int, error)
}

func (r *submissionRepository) ListDetails(page, limit int) ([]entities.SubmissionDetail, int, error) {
	offset := (page - 1) * limit
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM submissions`).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(`
		SELECT s.id, s.user_id, s.competition_id, s.started_at, s.submitted_at, s.score, s.status, s.violation_count,
			u.name, u.email, c.title,
			COALESCE(SUM(CASE WHEN a.answer = q.correct_answer THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN a.answer <> q.correct_answer THEN 1 ELSE 0 END), 0),
			COUNT(a.id)
		FROM submissions s
		JOIN users u ON u.id = s.user_id
		JOIN competitions c ON c.id = s.competition_id
		LEFT JOIN answers a ON a.submission_id = s.id
		LEFT JOIN questions q ON q.id = a.question_id
		GROUP BY s.id, u.name, u.email, c.title
		ORDER BY s.started_at DESC LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	items := []entities.SubmissionDetail{}
	for rows.Next() {
		var item entities.SubmissionDetail
		if err := rows.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.StartedAt, &item.SubmittedAt, &item.Score, &item.Status, &item.ViolationCount, &item.UserName, &item.UserEmail, &item.CompetitionTitle, &item.CorrectCount, &item.WrongCount, &item.TotalQuestions); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

type questionRepository struct{ db *sql.DB }
type submissionRepository struct{ db *sql.DB }

func NewQuestionRepository(db *sql.DB) QuestionRepository {
	return &questionRepository{db: db}
}

func NewSubmissionRepository(db *sql.DB) SubmissionRepository {
	return &submissionRepository{db: db}
}

func (r *questionRepository) Create(question *entities.Question) error {
	_, err := r.db.Exec(`INSERT INTO questions (id, competition_id, question, option_a, option_b, option_c, option_d, correct_answer, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		question.ID, question.CompetitionID, question.Question, question.OptionA, question.OptionB, question.OptionC, question.OptionD, question.CorrectAnswer, question.Score)
	return err
}

func (r *questionRepository) Update(question *entities.Question) error {
	result, err := r.db.Exec(`UPDATE questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, score = ? WHERE id = ?`,
		question.Question, question.OptionA, question.OptionB, question.OptionC, question.OptionD, question.CorrectAnswer, question.Score, question.ID)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *questionRepository) Delete(id string) error {
	result, err := r.db.Exec(`DELETE FROM questions WHERE id = ?`, id)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *questionRepository) FindByID(id string) (*entities.Question, error) {
	return scanQuestion(r.db.QueryRow(`SELECT id, competition_id, question, option_a, option_b, option_c, option_d, correct_answer, score FROM questions WHERE id = ?`, id), true)
}

func (r *questionRepository) ListByCompetition(competitionID string, includeAnswer bool) ([]entities.Question, error) {
	rows, err := r.db.Query(`SELECT id, competition_id, question, option_a, option_b, option_c, option_d, correct_answer, score FROM questions WHERE competition_id = ? ORDER BY id`, competitionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []entities.Question{}
	for rows.Next() {
		var item entities.Question
		if err := rows.Scan(&item.ID, &item.CompetitionID, &item.Question, &item.OptionA, &item.OptionB, &item.OptionC, &item.OptionD, &item.CorrectAnswer, &item.Score); err != nil {
			return nil, err
		}
		if !includeAnswer {
			item.CorrectAnswer = ""
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *submissionRepository) Start(submission *entities.Submission) error {
	_, err := r.db.Exec(`INSERT INTO submissions (id, user_id, competition_id, started_at, score, status) VALUES (?, ?, ?, ?, ?, ?)`,
		submission.ID, submission.UserID, submission.CompetitionID, submission.StartedAt, submission.Score, submission.Status)
	return err
}

func (r *submissionRepository) FindByID(id string) (*entities.Submission, error) {
	return scanSubmission(r.db.QueryRow(`SELECT id, user_id, competition_id, started_at, submitted_at, score, status, violation_count FROM submissions WHERE id = ?`, id))
}

func (r *submissionRepository) FindActive(userID, competitionID string) (*entities.Submission, error) {
	return scanSubmission(r.db.QueryRow(`SELECT id, user_id, competition_id, started_at, submitted_at, score, status, violation_count FROM submissions WHERE user_id = ? AND competition_id = ? ORDER BY started_at DESC LIMIT 1`, userID, competitionID))
}

func (r *submissionRepository) Submit(submissionID string, answers []entities.Answer, score float64) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var status string
	if err := tx.QueryRow(`SELECT status FROM submissions WHERE id = ? FOR UPDATE`, submissionID).Scan(&status); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return utils.ErrNotFound
		}
		return err
	}
	if status == entities.SubmissionSubmitted {
		return utils.ErrExamSubmitted
	}

	stmt, err := tx.Prepare(`INSERT INTO answers (id, submission_id, question_id, answer) VALUES (?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, answer := range answers {
		if _, err := stmt.Exec(answer.ID, answer.SubmissionID, answer.QuestionID, answer.Answer); err != nil {
			return err
		}
	}

	now := time.Now()
	if _, err := tx.Exec(`UPDATE submissions SET submitted_at = ?, score = ?, status = ? WHERE id = ?`, now, score, entities.SubmissionSubmitted, submissionID); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *submissionRepository) List(page, limit int) ([]entities.Submission, int, error) {
	offset := (page - 1) * limit
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM submissions`).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(`SELECT id, user_id, competition_id, started_at, submitted_at, score, status, violation_count FROM submissions ORDER BY started_at DESC LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []entities.Submission{}
	for rows.Next() {
		item, err := scanSubmissionRows(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *item)
	}
	return items, total, rows.Err()
}

func scanQuestion(row *sql.Row, includeAnswer bool) (*entities.Question, error) {
	var item entities.Question
	if err := row.Scan(&item.ID, &item.CompetitionID, &item.Question, &item.OptionA, &item.OptionB, &item.OptionC, &item.OptionD, &item.CorrectAnswer, &item.Score); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	if !includeAnswer {
		item.CorrectAnswer = ""
	}
	return &item, nil
}

func scanSubmission(row *sql.Row) (*entities.Submission, error) {
	var item entities.Submission
	if err := row.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.StartedAt, &item.SubmittedAt, &item.Score, &item.Status, &item.ViolationCount); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return &item, nil
}

type rowScanner interface {
	Scan(dest ...interface{}) error
}

func scanSubmissionRows(row rowScanner) (*entities.Submission, error) {
	var item entities.Submission
	if err := row.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.StartedAt, &item.SubmittedAt, &item.Score, &item.Status, &item.ViolationCount); err != nil {
		return nil, err
	}
	return &item, nil
}
