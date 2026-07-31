package repositories

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"
)

func TestSubmissionListDetailsStats(t *testing.T) {
	dsn := os.Getenv("BESC_TEST_MYSQL_DSN")
	if dsn == "" {
		t.Skip("set BESC_TEST_MYSQL_DSN to run MySQL repository integration tests")
	}

	db, err := sql.Open("mysql", ensureMySQLParam(dsn, "parseTime", "true"))
	if err != nil {
		t.Fatalf("open mysql: %v", err)
	}
	defer db.Close()

	dbName := fmt.Sprintf("besc_p107_%d", time.Now().UnixNano())
	execSQL(t, db, fmt.Sprintf("CREATE DATABASE `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName))
	defer execSQL(t, db, fmt.Sprintf("DROP DATABASE IF EXISTS `%s`", dbName))
	execSQL(t, db, fmt.Sprintf("USE `%s`", dbName))
	createSubmissionDetailStatsSchema(t, db)
	seedSubmissionDetailStats(t, db)

	repo := NewSubmissionRepository(db)
	items, total, err := repo.ListDetails(1, 10)
	if err != nil {
		t.Fatalf("list details: %v", err)
	}
	if total != 3 {
		t.Fatalf("expected total submissions 3, got %d", total)
	}

	byID := make(map[string]submissionStats)
	for _, item := range items {
		byID[item.ID] = submissionStats{
			total:      item.TotalQuestions,
			answered:   item.AnsweredQuestions,
			correct:    item.CorrectCount,
			wrong:      item.WrongCount,
			unanswered: item.UnansweredQuestions,
		}
	}

	assertSubmissionStats(t, byID, "sub-zero", submissionStats{total: 10, answered: 0, correct: 0, wrong: 0, unanswered: 10})
	assertSubmissionStats(t, byID, "sub-partial", submissionStats{total: 10, answered: 7, correct: 5, wrong: 2, unanswered: 3})
	assertSubmissionStats(t, byID, "sub-full", submissionStats{total: 10, answered: 10, correct: 10, wrong: 0, unanswered: 0})
}

type submissionStats struct {
	total      int
	answered   int
	correct    int
	wrong      int
	unanswered int
}

func assertSubmissionStats(t *testing.T, statsByID map[string]submissionStats, id string, expected submissionStats) {
	t.Helper()
	got, ok := statsByID[id]
	if !ok {
		t.Fatalf("missing submission %s", id)
	}
	if got != expected {
		t.Fatalf("stats for %s: expected %+v, got %+v", id, expected, got)
	}
	if got.answered != got.correct+got.wrong {
		t.Fatalf("stats for %s violate answered = correct + wrong: %+v", id, got)
	}
	if got.total != got.answered+got.unanswered {
		t.Fatalf("stats for %s violate total = answered + unanswered: %+v", id, got)
	}
}

func createSubmissionDetailStatsSchema(t *testing.T, db *sql.DB) {
	t.Helper()
	statements := []string{
		`CREATE TABLE users (
			id CHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE competitions (
			id CHAR(36) PRIMARY KEY,
			title VARCHAR(255) NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE submissions (
			id CHAR(36) PRIMARY KEY,
			user_id CHAR(36) NOT NULL,
			competition_id CHAR(36) NOT NULL,
			started_at DATETIME NOT NULL,
			submitted_at DATETIME NULL,
			score DECIMAL(8,2) NOT NULL DEFAULT 0,
			status ENUM('started', 'submitted') NOT NULL DEFAULT 'started',
			violation_count INT NOT NULL DEFAULT 0
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE questions (
			id CHAR(36) PRIMARY KEY,
			competition_id CHAR(36) NOT NULL,
			correct_answer ENUM('A', 'B', 'C', 'D', 'E') NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE answers (
			id CHAR(36) PRIMARY KEY,
			submission_id CHAR(36) NOT NULL,
			question_id CHAR(36) NOT NULL,
			answer ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
			UNIQUE KEY uq_answers_submission_question (submission_id, question_id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
	}
	for _, statement := range statements {
		execSQL(t, db, statement)
	}
}

func seedSubmissionDetailStats(t *testing.T, db *sql.DB) {
	t.Helper()
	execSQL(t, db, `INSERT INTO users (id, name, email) VALUES ('user-1', 'Test User', 'user@example.com')`)
	for _, competitionID := range []string{"comp-zero", "comp-partial", "comp-full"} {
		execSQL(t, db, `INSERT INTO competitions (id, title) VALUES (?, ?)`, competitionID, competitionID)
	}
	execSQL(t, db, `INSERT INTO submissions (id, user_id, competition_id, started_at, score, status) VALUES
		('sub-zero', 'user-1', 'comp-zero', '2026-01-01 10:00:00', 0, 'submitted'),
		('sub-partial', 'user-1', 'comp-partial', '2026-01-01 11:00:00', 41, 'submitted'),
		('sub-full', 'user-1', 'comp-full', '2026-01-01 12:00:00', 100, 'submitted')`)

	for _, competitionID := range []string{"comp-zero", "comp-partial", "comp-full"} {
		for index := 1; index <= 10; index++ {
			correctAnswer := "A"
			if competitionID == "comp-partial" {
				correctAnswer = []string{"A", "B", "C", "D", "E", "A", "E", "B", "C", "D"}[index-1]
			}
			execSQL(t, db, `INSERT INTO questions (id, competition_id, correct_answer) VALUES (?, ?, ?)`, fmt.Sprintf("%s-q%d", competitionID, index), competitionID, correctAnswer)
		}
	}

	partialAnswers := []struct {
		questionID string
		answer     string
	}{
		{"comp-partial-q1", "A"},
		{"comp-partial-q2", "B"},
		{"comp-partial-q3", "C"},
		{"comp-partial-q4", "D"},
		{"comp-partial-q5", "E"},
		{"comp-partial-q6", "B"},
		{"comp-partial-q7", "A"},
	}
	for index, answer := range partialAnswers {
		execSQL(t, db, `INSERT INTO answers (id, submission_id, question_id, answer) VALUES (?, 'sub-partial', ?, ?)`, fmt.Sprintf("partial-a%d", index+1), answer.questionID, answer.answer)
	}
	for index := 1; index <= 10; index++ {
		execSQL(t, db, `INSERT INTO answers (id, submission_id, question_id, answer) VALUES (?, 'sub-full', ?, 'A')`, fmt.Sprintf("full-a%d", index), fmt.Sprintf("comp-full-q%d", index))
	}
}

func execSQL(t *testing.T, db *sql.DB, query string, args ...interface{}) {
	t.Helper()
	if _, err := db.Exec(query, args...); err != nil {
		t.Fatalf("exec %q: %v", query, err)
	}
}

func ensureMySQLParam(dsn, key, value string) string {
	if strings.Contains(dsn, key+"=") {
		return dsn
	}
	separator := "?"
	if strings.Contains(dsn, "?") {
		separator = "&"
	}
	return dsn + separator + key + "=" + value
}
