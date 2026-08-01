package services

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
    "online-competition-platform/internal/repositories"
)

func TestExamStartReturnsExistingSubmissionWhenInsertHitsUniqueConflict(t *testing.T) {
	existing := &entities.Submission{
		ID:            "existing-submission",
		UserID:        "user-1",
		CompetitionID: "competition-1",
		StartedAt:     time.Now(),
		Status:        entities.SubmissionStarted,
	}
	submissions := &fakeSubmissionRepository{
		findActiveResults: []submissionResult{
			{err: utils.ErrNotFound},
			{submission: existing},
		},
		startErr: utils.ErrConflict,
	}
	service := newTestExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		submissions,
	)

	result, err := service.Start("user-1", "competition-1")
	if err != nil {
		t.Fatalf("expected existing submission, got error %v", err)
	}
	if result.ID != existing.ID {
		t.Fatalf("expected existing submission %s, got %s", existing.ID, result.ID)
	}
	if submissions.startCalls != 1 {
		t.Fatalf("expected one insert attempt, got %d", submissions.startCalls)
	}
}

func TestExamStartCreatesSubmissionForVerifiedRegistrationWithQuestions(t *testing.T) {
	submissions := &fakeSubmissionRepository{
		findActiveResults: []submissionResult{{err: utils.ErrNotFound}},
	}
	service := newTestExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		submissions,
	)

	result, err := service.Start("user-1", "competition-1")
	if err != nil {
		t.Fatalf("expected start to succeed, got %v", err)
	}
	if result.Status != entities.SubmissionStarted {
		t.Fatalf("expected started submission, got %s", result.Status)
	}
	if submissions.startCalls != 1 {
		t.Fatalf("expected one submission insert, got %d", submissions.startCalls)
	}
}

func TestExamStartRejectsPendingPayment(t *testing.T) {
	registration := verifiedRegistration()
	registration.Status = entities.RegistrationPending
	service := newTestExamService(
		&fakeRegistrationRepository{registration: registration},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		&fakeSubmissionRepository{},
	)

	_, err := service.Start("user-1", "competition-1")
	if !errors.Is(err, utils.ErrPaymentPending) {
		t.Fatalf("expected ErrPaymentPending, got %v", err)
	}
}

func TestExamStartRejectsBeforeStartTime(t *testing.T) {
	service := newTestExamServiceWithCompetition(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeCompetitionRepository{competition: competitionWindow(time.Now().Add(time.Hour), time.Now().Add(2*time.Hour))},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		&fakeSubmissionRepository{},
	)

	_, err := service.Start("user-1", "competition-1")
	if !errors.Is(err, utils.ErrExamNotStarted) {
		t.Fatalf("expected ErrExamNotStarted, got %v", err)
	}
}

func TestExamStartRejectsAfterEndTime(t *testing.T) {
	service := newTestExamServiceWithCompetition(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeCompetitionRepository{competition: competitionWindow(time.Now().Add(-2*time.Hour), time.Now().Add(-time.Minute))},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		&fakeSubmissionRepository{},
	)

	_, err := service.Start("user-1", "competition-1")
	if !errors.Is(err, utils.ErrExamClosed) {
		t.Fatalf("expected ErrExamClosed, got %v", err)
	}
}

func TestExamSubmitRejectsAfterEndTime(t *testing.T) {
	submissions := &fakeSubmissionRepository{findActiveResults: []submissionResult{{
		submission: &entities.Submission{
			ID:            "submission-1",
			UserID:        "user-1",
			CompetitionID: "competition-1",
			Status:        entities.SubmissionStarted,
		},
	}}}
	service := newTestExamServiceWithCompetition(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeCompetitionRepository{competition: competitionWindow(time.Now().Add(-2*time.Hour), time.Now().Add(-time.Minute))},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1", CorrectAnswer: "A", Score: 10}}},
		submissions,
	)

	_, err := service.Submit("user-1", "competition-1", dto.SubmitExamRequest{
		Answers: []dto.AnswerRequest{{QuestionID: "question-1", Answer: "A"}},
	})
	if !errors.Is(err, utils.ErrExamClosed) {
		t.Fatalf("expected ErrExamClosed, got %v", err)
	}
	if submissions.submitCalls != 0 {
		t.Fatalf("expected repository Submit not to be called, got %d", submissions.submitCalls)
	}
}

func TestExamStartRejectsRejectedPayment(t *testing.T) {
	registration := verifiedRegistration()
	registration.Status = entities.RegistrationRejected
	service := newTestExamService(
		&fakeRegistrationRepository{registration: registration},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		&fakeSubmissionRepository{},
	)

	_, err := service.Start("user-1", "competition-1")
	if !errors.Is(err, utils.ErrPaymentPending) {
		t.Fatalf("expected ErrPaymentPending, got %v", err)
	}
}

func TestExamStartRejectsMissingRegistrationOrWrongUser(t *testing.T) {
	service := newTestExamService(
		&fakeRegistrationRepository{err: utils.ErrNotFound},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		&fakeSubmissionRepository{},
	)

	_, err := service.Start("other-user", "competition-1")
	if !errors.Is(err, utils.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestExamStartRejectsNoQuestionsBeforeCreatingSubmission(t *testing.T) {
	submissions := &fakeSubmissionRepository{}
	service := newTestExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{},
		submissions,
	)

	_, err := service.Start("user-1", "competition-1")
	if !errors.Is(err, utils.ErrNoQuestions) {
		t.Fatalf("expected ErrNoQuestions, got %v", err)
	}
	if submissions.startCalls != 0 {
		t.Fatalf("submission should not be created when questions are missing, got %d calls", submissions.startCalls)
	}
}

func TestExamQuestionsRejectsNoQuestions(t *testing.T) {
	service := newTestExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{},
		&fakeSubmissionRepository{},
	)

	_, err := service.Questions("user-1", "competition-1")
	if !errors.Is(err, utils.ErrNoQuestions) {
		t.Fatalf("expected ErrNoQuestions, got %v", err)
	}
}

func TestExamStartRejectsAlreadySubmittedExam(t *testing.T) {
	service := newTestExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{questions: []entities.Question{{ID: "question-1"}}},
		&fakeSubmissionRepository{findActiveResults: []submissionResult{{
			submission: &entities.Submission{ID: "submission-1", Status: entities.SubmissionSubmitted},
		}}},
	)

	_, err := service.Start("user-1", "competition-1")
	if !errors.Is(err, utils.ErrExamSubmitted) {
		t.Fatalf("expected ErrExamSubmitted, got %v", err)
	}
}

func TestExamSubmitRejectsDuplicateAnswersForSameQuestion(t *testing.T) {
	submissions := &fakeSubmissionRepository{
		findActiveResults: []submissionResult{{
			submission: &entities.Submission{
				ID:            "submission-1",
				UserID:        "user-1",
				CompetitionID: "competition-1",
				Status:        entities.SubmissionStarted,
			},
		}},
	}
	service := newTestExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{questions: []entities.Question{{
			ID:            "question-1",
			CompetitionID: "competition-1",
			CorrectAnswer: "A",
			Score:         10,
			WrongScore:    2,
		}}},
		submissions,
	)

	_, err := service.Submit("user-1", "competition-1", dto.SubmitExamRequest{
		Answers: []dto.AnswerRequest{
			{QuestionID: "question-1", Answer: "A"},
			{QuestionID: "question-1", Answer: "B"},
		},
	})
	if !errors.Is(err, utils.ErrInvalidInput) {
		t.Fatalf("expected ErrInvalidInput, got %v", err)
	}
	if submissions.submitCalls != 0 {
		t.Fatalf("expected repository Submit not to be called, got %d", submissions.submitCalls)
	}
}

func TestExamSubmitSecondCallDoesNotSubmitAgain(t *testing.T) {
	submissions := &fakeSubmissionRepository{
		findActiveResults: []submissionResult{
			{
				submission: &entities.Submission{
					ID:            "submission-1",
					UserID:        "user-1",
					CompetitionID: "competition-1",
					Status:        entities.SubmissionStarted,
				},
			},
			{
				submission: &entities.Submission{
					ID:            "submission-1",
					UserID:        "user-1",
					CompetitionID: "competition-1",
					Status:        entities.SubmissionSubmitted,
					Score:         10,
				},
			},
		},
	}
	service := newTestExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{questions: []entities.Question{{
			ID:            "question-1",
			CompetitionID: "competition-1",
			CorrectAnswer: "A",
			Score:         10,
			WrongScore:    2,
		}}},
		submissions,
	)

	_, err := service.Submit("user-1", "competition-1", dto.SubmitExamRequest{
		Answers: []dto.AnswerRequest{{QuestionID: "question-1", Answer: "A"}},
	})
	if err != nil {
		t.Fatalf("expected first submit to succeed, got %v", err)
	}

	_, err = service.Submit("user-1", "competition-1", dto.SubmitExamRequest{
		Answers: []dto.AnswerRequest{{QuestionID: "question-1", Answer: "A"}},
	})
	if !errors.Is(err, utils.ErrExamSubmitted) {
		t.Fatalf("expected ErrExamSubmitted on second submit, got %v", err)
	}
	if submissions.submitCalls != 1 {
		t.Fatalf("expected repository Submit to be called once, got %d", submissions.submitCalls)
	}
}

func verifiedRegistration() *entities.Registration {
	return &entities.Registration{
		ID:            "registration-1",
		UserID:        "user-1",
		CompetitionID: "competition-1",
		Status:        entities.RegistrationVerified,
	}
}

func newTestExamService(registrations repositories.RegistrationRepository, questions repositories.QuestionRepository, submissions repositories.SubmissionRepository) ExamService {
	return newTestExamServiceWithCompetition(registrations, &fakeCompetitionRepository{competition: competitionWindow(time.Now().Add(-time.Hour), time.Now().Add(time.Hour))}, questions, submissions)
}

func newTestExamServiceWithCompetition(registrations repositories.RegistrationRepository, competitions repositories.CompetitionRepository, questions repositories.QuestionRepository, submissions repositories.SubmissionRepository) ExamService {
	return NewExamService(registrations, competitions, questions, submissions)
}

func competitionWindow(start, end time.Time) *entities.Competition {
	return &entities.Competition{
		ID:        "competition-1",
		Status:    entities.CompetitionPublished,
		StartTime: start,
		EndTime:   end,
	}
}

type fakeRegistrationRepository struct {
	registration *entities.Registration
	err          error
}

func (r *fakeRegistrationRepository) Create(registration *entities.Registration) error {
	return nil
}

func (r *fakeRegistrationRepository) FindByUserAndCompetition(userID, competitionID string) (*entities.Registration, error) {
	if r.err != nil {
		return nil, r.err
	}
	return r.registration, nil
}

func (r *fakeRegistrationRepository) FindByID(id string) (*entities.Registration, error) {
	return r.registration, r.err
}

func (r *fakeRegistrationRepository) ListByUser(userID string, page, limit int) ([]entities.RegistrationDetail, int, error) {
	return nil, 0, nil
}

func (r *fakeRegistrationRepository) UpdateStatusTx(tx *sql.Tx, registrationID, status string) error {
	return nil
}

type fakeQuestionRepository struct {
	questions []entities.Question
	err       error
}

func (r *fakeQuestionRepository) Create(question *entities.Question) error {
	return nil
}

func (r *fakeQuestionRepository) Update(question *entities.Question) error {
	return nil
}

func (r *fakeQuestionRepository) Delete(id string) error {
	return nil
}

func (r *fakeQuestionRepository) FindByID(id string) (*entities.Question, error) {
	if r.err != nil {
		return nil, r.err
	}
	if len(r.questions) == 0 {
		return nil, utils.ErrNotFound
	}
	return &r.questions[0], nil
}

func (r *fakeQuestionRepository) ListByCompetition(competitionID string, includeAnswer bool) ([]entities.Question, error) {
	if r.err != nil {
		return nil, r.err
	}
	return r.questions, nil
}

type submissionResult struct {
	submission *entities.Submission
	err        error
}

type fakeSubmissionRepository struct {
	findActiveResults []submissionResult
	startErr          error
	startCalls        int
	submitCalls       int
}

func (r *fakeSubmissionRepository) Start(submission *entities.Submission) error {
	r.startCalls++
	return r.startErr
}

func (r *fakeSubmissionRepository) FindByID(id string) (*entities.Submission, error) {
	return nil, utils.ErrNotFound
}

func (r *fakeSubmissionRepository) FindActive(userID, competitionID string) (*entities.Submission, error) {
	if len(r.findActiveResults) == 0 {
		return nil, utils.ErrNotFound
	}
	result := r.findActiveResults[0]
	r.findActiveResults = r.findActiveResults[1:]
	if result.err != nil {
		return nil, result.err
	}
	return result.submission, nil
}

func (r *fakeSubmissionRepository) Submit(submissionID string, answers []entities.Answer, score float64) error {
	r.submitCalls++
	return nil
}

func (r *fakeSubmissionRepository) List(page, limit int) ([]entities.Submission, int, error) {
	return nil, 0, nil
}

func (r *fakeSubmissionRepository) ListDetails(page, limit int) ([]entities.SubmissionDetail, int, error) {
	return nil, 0, nil
}

type fakeCompetitionRepository struct {
	competition *entities.Competition
	err         error
}

func (r *fakeCompetitionRepository) Create(item *entities.Competition) error { return nil }
func (r *fakeCompetitionRepository) Update(item *entities.Competition) error { return nil }
func (r *fakeCompetitionRepository) Delete(id string) error { return nil }
func (r *fakeCompetitionRepository) FindByID(id string) (*entities.Competition, error) {
	if r.err != nil { return nil, r.err }
	if r.competition == nil { return nil, utils.ErrNotFound }
	return r.competition, nil
}
func (r *fakeCompetitionRepository) FindBySlug(slug string) (*entities.Competition, error) { return r.FindByID("") }
func (r *fakeCompetitionRepository) List(page, limit int) ([]entities.Competition, int, error) { return nil, 0, nil }
