package repositories

import (
	"database/sql"
	"errors"
	"time"

	"github.com/go-sql-driver/mysql"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

type QuestionRepository interface {
	Create(question *entities.Question) error
	Update(question *entities.Question) error
	Delete(id string) error
	FindByID(id string) (*entities.Question, error)
	ListByCompetition(competitionID string, includeAnswer bool) ([]entities.Question, error)
	ListByCompetitionRound(competitionID, round string, includeAnswer bool) ([]entities.Question, error)
}

type SubmissionRepository interface {
	Start(submission *entities.Submission) error
	FindByID(id string) (*entities.Submission, error)
	FindActive(userID, competitionID string) (*entities.Submission, error)
	FindActiveRound(userID, competitionID, round string) (*entities.Submission, error)
	Submit(submissionID string, answers []entities.Answer, score float64) error
	List(page, limit int) ([]entities.Submission, int, error)
	ListDetails(page, limit int) ([]entities.SubmissionDetail, int, error)
	ReviewDetail(submissionID string) (*dto.SubmissionReviewDetail, error)
}

func (r *submissionRepository) ListDetails(page, limit int) ([]entities.SubmissionDetail, int, error) {
	offset := (page - 1) * limit
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM submissions WHERE status = ?`, entities.SubmissionSubmitted).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(`
		SELECT s.id, s.user_id, s.competition_id, s.started_at, s.submitted_at, s.score, s.status, s.violation_count,
			COALESCE(s.round, ?), u.name, u.email, c.title,
			TIMESTAMPDIFF(SECOND, s.started_at, s.submitted_at),
			COALESCE(answer_stats.correct_count, 0),
			COALESCE(answer_stats.wrong_count, 0),
			COALESCE(answer_stats.answered_questions, 0),
			GREATEST(COALESCE(question_stats.total_questions, 0) - COALESCE(answer_stats.answered_questions, 0), 0),
			COALESCE(question_stats.total_questions, 0)
		FROM submissions s
		JOIN users u ON u.id = s.user_id
		JOIN competitions c ON c.id = s.competition_id
		LEFT JOIN (
			SELECT competition_id, COALESCE(round, ?) AS round, COUNT(*) AS total_questions
			FROM questions
			GROUP BY competition_id, COALESCE(round, ?)
		) question_stats ON question_stats.competition_id = s.competition_id AND question_stats.round = COALESCE(s.round, ?)
		LEFT JOIN (
			SELECT a.submission_id,
				COUNT(*) AS answered_questions,
				SUM(CASE WHEN a.answer = q.correct_answer THEN 1 ELSE 0 END) AS correct_count,
				SUM(CASE WHEN a.answer <> q.correct_answer THEN 1 ELSE 0 END) AS wrong_count
			FROM answers a
			JOIN questions q ON q.id = a.question_id
			GROUP BY a.submission_id
		) answer_stats ON answer_stats.submission_id = s.id
		WHERE s.status = ?
		ORDER BY c.id ASC, s.score DESC, TIMESTAMPDIFF(SECOND, s.started_at, s.submitted_at) ASC, s.submitted_at ASC, s.id ASC
		LIMIT ? OFFSET ?`, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, entities.SubmissionSubmitted, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	items := []entities.SubmissionDetail{}
	for rows.Next() {
		var item entities.SubmissionDetail
		if err := rows.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.StartedAt, &item.SubmittedAt, &item.Score, &item.Status, &item.ViolationCount, &item.Round, &item.UserName, &item.UserEmail, &item.CompetitionTitle, &item.DurationSeconds, &item.CorrectCount, &item.WrongCount, &item.AnsweredQuestions, &item.UnansweredQuestions, &item.TotalQuestions); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (r *submissionRepository) ReviewDetail(submissionID string) (*dto.SubmissionReviewDetail, error) {
	var result dto.SubmissionReviewDetail
	if err := r.db.QueryRow(`
		SELECT s.id, COALESCE(s.round, ?), u.name, u.email, c.title, s.score,
			COALESCE(answer_stats.correct_count, 0),
			COALESCE(answer_stats.wrong_count, 0),
			COALESCE(answer_stats.answered_questions, 0),
			GREATEST(COALESCE(question_stats.total_questions, 0) - COALESCE(answer_stats.answered_questions, 0), 0),
			COALESCE(question_stats.total_questions, 0)
		FROM submissions s
		JOIN users u ON u.id = s.user_id
		JOIN competitions c ON c.id = s.competition_id
		LEFT JOIN (
			SELECT competition_id, COALESCE(round, ?) AS round, COUNT(*) AS total_questions
			FROM questions
			GROUP BY competition_id, COALESCE(round, ?)
		) question_stats ON question_stats.competition_id = s.competition_id AND question_stats.round = COALESCE(s.round, ?)
		LEFT JOIN (
			SELECT a.submission_id,
				COUNT(*) AS answered_questions,
				SUM(CASE WHEN a.answer = q.correct_answer THEN 1 ELSE 0 END) AS correct_count,
				SUM(CASE WHEN a.answer <> q.correct_answer THEN 1 ELSE 0 END) AS wrong_count
			FROM answers a
			JOIN questions q ON q.id = a.question_id
			GROUP BY a.submission_id
		) answer_stats ON answer_stats.submission_id = s.id
		WHERE s.id = ? AND s.status = ?
	`, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, submissionID, entities.SubmissionSubmitted).Scan(&result.SubmissionID, &result.Round, &result.UserName, &result.UserEmail, &result.CompetitionTitle, &result.Score, &result.CorrectCount, &result.WrongCount, &result.AnsweredQuestions, &result.UnansweredQuestions, &result.TotalQuestions); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}

	rows, err := r.db.Query(`
		SELECT q.id, COALESCE(q.round, ?), q.question, COALESCE(q.image, ''), q.option_a, q.option_b, q.option_c, q.option_d, q.option_e,
			q.correct_answer, q.score, q.wrong_score, COALESCE(a.answer, '')
		FROM submissions s
		JOIN questions q ON q.competition_id = s.competition_id AND COALESCE(q.round, ?) = COALESCE(s.round, ?)
		LEFT JOIN answers a ON a.submission_id = s.id AND a.question_id = q.id
		WHERE s.id = ?
		ORDER BY q.id
	`, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, entities.ExamRoundPreliminary, submissionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result.Review = []dto.QuestionReviewItem{}
	for rows.Next() {
		var item dto.QuestionReviewItem
		var correctScore, wrongScore float64
		if err := rows.Scan(&item.QuestionID, &item.Round, &item.Question, &item.Image, &item.OptionA, &item.OptionB, &item.OptionC, &item.OptionD, &item.OptionE, &item.CorrectAnswer, &correctScore, &wrongScore, &item.UserAnswer); err != nil {
			return nil, err
		}
		item.IsCorrect = item.UserAnswer != "" && item.UserAnswer == item.CorrectAnswer
		if item.UserAnswer == "" {
			item.ScoreEarned = 0
		} else if item.IsCorrect {
			item.ScoreEarned = correctScore
		} else {
			item.ScoreEarned = -wrongScore
		}
		result.Review = append(result.Review, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return &result, nil
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
	_, err := r.db.Exec(`INSERT INTO questions (id, competition_id, round, question, image, option_a, option_b, option_c, option_d, option_e, correct_answer, score, wrong_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		question.ID, question.CompetitionID, question.Round, question.Question, question.Image, question.OptionA, question.OptionB, question.OptionC, question.OptionD, question.OptionE, question.CorrectAnswer, question.Score, question.WrongScore)
	return err
}

func (r *questionRepository) Update(question *entities.Question) error {
	result, err := r.db.Exec(`UPDATE questions SET round = ?, question = ?, image = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, option_e = ?, correct_answer = ?, score = ?, wrong_score = ? WHERE id = ?`,
		question.Round, question.Question, question.Image, question.OptionA, question.OptionB, question.OptionC, question.OptionD, question.OptionE, question.CorrectAnswer, question.Score, question.WrongScore, question.ID)
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
	return scanQuestion(r.db.QueryRow(`SELECT id, competition_id, COALESCE(round, ?), question, COALESCE(image, ''), option_a, option_b, option_c, option_d, option_e, correct_answer, score, wrong_score FROM questions WHERE id = ?`, entities.ExamRoundPreliminary, id), true)
}

func (r *questionRepository) ListByCompetition(competitionID string, includeAnswer bool) ([]entities.Question, error) {
	rows, err := r.db.Query(`SELECT id, competition_id, COALESCE(round, ?), question, COALESCE(image, ''), option_a, option_b, option_c, option_d, option_e, correct_answer, score, wrong_score FROM questions WHERE competition_id = ? ORDER BY FIELD(COALESCE(round, ?), 'preliminary', 'semifinal'), id`, entities.ExamRoundPreliminary, competitionID, entities.ExamRoundPreliminary)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []entities.Question{}
	for rows.Next() {
		var item entities.Question
		if err := rows.Scan(&item.ID, &item.CompetitionID, &item.Round, &item.Question, &item.Image, &item.OptionA, &item.OptionB, &item.OptionC, &item.OptionD, &item.OptionE, &item.CorrectAnswer, &item.Score, &item.WrongScore); err != nil {
			return nil, err
		}
		if !includeAnswer {
			item.CorrectAnswer = ""
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *questionRepository) ListByCompetitionRound(competitionID, round string, includeAnswer bool) ([]entities.Question, error) {
	rows, err := r.db.Query(`SELECT id, competition_id, COALESCE(round, ?), question, COALESCE(image, ''), option_a, option_b, option_c, option_d, option_e, correct_answer, score, wrong_score FROM questions WHERE competition_id = ? AND COALESCE(round, ?) = ? ORDER BY id`, entities.ExamRoundPreliminary, competitionID, entities.ExamRoundPreliminary, round)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []entities.Question{}
	for rows.Next() {
		var item entities.Question
		if err := rows.Scan(&item.ID, &item.CompetitionID, &item.Round, &item.Question, &item.Image, &item.OptionA, &item.OptionB, &item.OptionC, &item.OptionD, &item.OptionE, &item.CorrectAnswer, &item.Score, &item.WrongScore); err != nil {
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
	_, err := r.db.Exec(`INSERT INTO submissions (id, user_id, competition_id, round, started_at, score, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		submission.ID, submission.UserID, submission.CompetitionID, submission.Round, submission.StartedAt, submission.Score, submission.Status)
	if isDuplicateKeyError(err) {
		return utils.ErrConflict
	}
	return err
}

func (r *submissionRepository) FindByID(id string) (*entities.Submission, error) {
	return scanSubmission(r.db.QueryRow(`SELECT id, user_id, competition_id, COALESCE(round, ?), started_at, submitted_at, score, status, violation_count FROM submissions WHERE id = ?`, entities.ExamRoundPreliminary, id))
}

func isDuplicateKeyError(err error) bool {
	var mysqlErr *mysql.MySQLError
	return errors.As(err, &mysqlErr) && mysqlErr.Number == 1062
}

func (r *submissionRepository) FindActive(userID, competitionID string) (*entities.Submission, error) {
	return r.FindActiveRound(userID, competitionID, entities.ExamRoundPreliminary)
}

func (r *submissionRepository) FindActiveRound(userID, competitionID, round string) (*entities.Submission, error) {
	return scanSubmission(r.db.QueryRow(`SELECT id, user_id, competition_id, COALESCE(round, ?), started_at, submitted_at, score, status, violation_count FROM submissions WHERE user_id = ? AND competition_id = ? AND COALESCE(round, ?) = ? ORDER BY started_at DESC LIMIT 1`, entities.ExamRoundPreliminary, userID, competitionID, entities.ExamRoundPreliminary, round))
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
	rows, err := r.db.Query(`SELECT id, user_id, competition_id, COALESCE(round, ?), started_at, submitted_at, score, status, violation_count FROM submissions ORDER BY started_at DESC LIMIT ? OFFSET ?`, entities.ExamRoundPreliminary, limit, offset)
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
	if err := row.Scan(&item.ID, &item.CompetitionID, &item.Round, &item.Question, &item.Image, &item.OptionA, &item.OptionB, &item.OptionC, &item.OptionD, &item.OptionE, &item.CorrectAnswer, &item.Score, &item.WrongScore); err != nil {
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
	if err := row.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.Round, &item.StartedAt, &item.SubmittedAt, &item.Score, &item.Status, &item.ViolationCount); err != nil {
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
	if err := row.Scan(&item.ID, &item.UserID, &item.CompetitionID, &item.Round, &item.StartedAt, &item.SubmittedAt, &item.Score, &item.Status, &item.ViolationCount); err != nil {
		return nil, err
	}
	return &item, nil
}
