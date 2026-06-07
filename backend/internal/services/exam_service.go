package services

import (
	"time"

	"github.com/google/uuid"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
	"online-competition-platform/internal/utils"
)

type ExamService interface {
	Questions(userID, competitionID string) ([]entities.Question, error)
	Start(userID, competitionID string) (*entities.Submission, error)
	Submit(userID, competitionID string, input dto.SubmitExamRequest) (*dto.SubmissionResult, error)
	Monitor(page, limit int) ([]entities.SubmissionDetail, int, error)
}

type examService struct {
	registrations repositories.RegistrationRepository
	questions     repositories.QuestionRepository
	submissions   repositories.SubmissionRepository
}

func NewExamService(registrations repositories.RegistrationRepository, questions repositories.QuestionRepository, submissions repositories.SubmissionRepository) ExamService {
	return &examService{registrations: registrations, questions: questions, submissions: submissions}
}

func (s *examService) Questions(userID, competitionID string) ([]entities.Question, error) {
	if err := s.ensureVerified(userID, competitionID); err != nil {
		return nil, err
	}
	return s.questions.ListByCompetition(competitionID, false)
}

func (s *examService) Start(userID, competitionID string) (*entities.Submission, error) {
	if err := s.ensureVerified(userID, competitionID); err != nil {
		return nil, err
	}
	if existing, err := s.submissions.FindActive(userID, competitionID); err == nil {
		return existing, nil
	}
	submission := &entities.Submission{
		ID:            uuid.NewString(),
		UserID:        userID,
		CompetitionID: competitionID,
		StartedAt:     time.Now(),
		Score:         0,
		Status:        entities.SubmissionStarted,
	}
	return submission, s.submissions.Start(submission)
}

func (s *examService) Submit(userID, competitionID string, input dto.SubmitExamRequest) (*dto.SubmissionResult, error) {
	if err := s.ensureVerified(userID, competitionID); err != nil {
		return nil, err
	}
	submission, err := s.submissions.FindActive(userID, competitionID)
	if err != nil {
		submission, err = s.Start(userID, competitionID)
		if err != nil {
			return nil, err
		}
	}

	questions, err := s.questions.ListByCompetition(competitionID, true)
	if err != nil {
		return nil, err
	}
	questionMap := map[string]entities.Question{}
	for _, question := range questions {
		questionMap[question.ID] = question
	}

	score := 0.0
	answers := make([]entities.Answer, 0, len(input.Answers))
	for _, answerInput := range input.Answers {
		question, ok := questionMap[answerInput.QuestionID]
		if !ok {
			return nil, utils.ErrInvalidInput
		}
		if answerInput.Answer == question.CorrectAnswer {
			score += question.Score
		}
		answers = append(answers, entities.Answer{
			ID:           uuid.NewString(),
			SubmissionID: submission.ID,
			QuestionID:   answerInput.QuestionID,
			Answer:       answerInput.Answer,
		})
	}

	if err := s.submissions.Submit(submission.ID, answers, score); err != nil {
		return nil, err
	}
	return &dto.SubmissionResult{SubmissionID: submission.ID, Score: score, Status: entities.SubmissionSubmitted}, nil
}

func (s *examService) Monitor(page, limit int) ([]entities.SubmissionDetail, int, error) {
	return s.submissions.ListDetails(page, limit)
}

func (s *examService) ensureVerified(userID, competitionID string) error {
	registration, err := s.registrations.FindByUserAndCompetition(userID, competitionID)
	if err != nil {
		return err
	}
	if registration.Status != entities.RegistrationVerified {
		return utils.ErrPaymentPending
	}
	return nil
}
