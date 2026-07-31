package services

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
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
	service := NewExamService(
		&fakeRegistrationRepository{registration: verifiedRegistration()},
		&fakeQuestionRepository{},
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
	service := NewExamService(
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
	service := NewExamService(
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
