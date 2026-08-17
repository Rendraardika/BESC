package services

import (
	"errors"
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
	competitions  repositories.CompetitionRepository
	questions     repositories.QuestionRepository
	submissions   repositories.SubmissionRepository
}

func NewExamService(registrations repositories.RegistrationRepository, competitions repositories.CompetitionRepository, questions repositories.QuestionRepository, submissions repositories.SubmissionRepository) ExamService {
	return &examService{registrations: registrations, competitions: competitions, questions: questions, submissions: submissions}
}

func (s *examService) Questions(userID, competitionID string) ([]entities.Question, error) {
	if err := s.ensureVerified(userID, competitionID); err != nil {
		return nil, err
	}
	if err := s.ensureExamWindow(competitionID); err != nil {
		return nil, err
	}
	questions, err := s.questions.ListByCompetition(competitionID, false)
	if err != nil {
		return nil, err
	}
	if len(questions) == 0 {
		return nil, utils.ErrNoQuestions
	}
	return questions, nil
}

func (s *examService) Start(userID, competitionID string) (*entities.Submission, error) {
	if err := s.ensureVerified(userID, competitionID); err != nil {
		return nil, err
	}
	if err := s.ensureExamWindow(competitionID); err != nil {
		return nil, err
	}
	if err := s.ensureQuestionsAvailable(competitionID); err != nil {
		return nil, err
	}
	if existing, err := s.submissions.FindActive(userID, competitionID); err == nil {
		if existing.Status == entities.SubmissionSubmitted {
			return nil, utils.ErrExamSubmitted
		}
		return existing, nil
	}
	submission := &entities.Submission{
		ID:            uuid.NewString(),
		UserID:        userID,
		CompetitionID: competitionID,
		StartedAt:     time.Now().UTC(),
		Score:         0,
		Status:        entities.SubmissionStarted,
	}
	if err := s.submissions.Start(submission); err != nil {
		if errors.Is(err, utils.ErrConflict) {
			existing, findErr := s.submissions.FindActive(userID, competitionID)
			if findErr != nil {
				return nil, findErr
			}
			if existing.Status == entities.SubmissionSubmitted {
				return nil, utils.ErrExamSubmitted
			}
			return existing, nil
		}
		return nil, err
	}
	return submission, nil
}

func (s *examService) Submit(userID, competitionID string, input dto.SubmitExamRequest) (*dto.SubmissionResult, error) {
	if err := s.ensureVerified(userID, competitionID); err != nil {
		return nil, err
	}
	if err := s.ensureExamWindow(competitionID); err != nil {
		return nil, err
	}
	submission, err := s.submissions.FindActive(userID, competitionID)
	if err != nil {
		submission, err = s.Start(userID, competitionID)
		if err != nil {
			return nil, err
		}
	}
	if submission.Status == entities.SubmissionSubmitted {
		return nil, utils.ErrExamSubmitted
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
	correctCount := 0
	wrongCount := 0
	answers := make([]entities.Answer, 0, len(input.Answers))
	seenAnswers := make(map[string]string, len(input.Answers))
	for _, answerInput := range input.Answers {
		question, ok := questionMap[answerInput.QuestionID]
		if !ok {
			return nil, utils.ErrInvalidInput
		}
		if _, exists := seenAnswers[answerInput.QuestionID]; exists {
			return nil, utils.ErrInvalidInput
		}
		seenAnswers[answerInput.QuestionID] = answerInput.Answer
		if answerInput.Answer == question.CorrectAnswer {
			score += question.Score
			correctCount++
		} else {
			score -= question.WrongScore
			wrongCount++
		}
		answers = append(answers, entities.Answer{
			ID:           uuid.NewString(),
			SubmissionID: submission.ID,
			QuestionID:   answerInput.QuestionID,
			Answer:       answerInput.Answer,
		})
	}
	if score < 0 {
		score = 0
	}

	if err := s.submissions.Submit(submission.ID, answers, score); err != nil {
		return nil, err
	}

	reviewItems := make([]dto.QuestionReviewItem, 0, len(questions))
	for _, q := range questions {
		userAns := seenAnswers[q.ID]
		isCorrect := userAns != "" && userAns == q.CorrectAnswer
		earned := 0.0
		if userAns != "" {
			if isCorrect {
				earned = q.Score
			} else {
				earned = -q.WrongScore
			}
		}
		reviewItems = append(reviewItems, dto.QuestionReviewItem{
			QuestionID:    q.ID,
			Question:      q.Question,
			Image:         q.Image,
			OptionA:       q.OptionA,
			OptionB:       q.OptionB,
			OptionC:       q.OptionC,
			OptionD:       q.OptionD,
			OptionE:       q.OptionE,
			UserAnswer:    userAns,
			CorrectAnswer: q.CorrectAnswer,
			IsCorrect:     isCorrect,
			ScoreEarned:   earned,
		})
	}

	return &dto.SubmissionResult{
		SubmissionID:   submission.ID,
		Score:          score,
		CorrectCount:   correctCount,
		WrongCount:     wrongCount,
		TotalQuestions: len(questions),
		Status:         entities.SubmissionSubmitted,
		Review:         reviewItems,
	}, nil
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

func (s *examService) ensureQuestionsAvailable(competitionID string) error {
	questions, err := s.questions.ListByCompetition(competitionID, false)
	if err != nil {
		return err
	}
	if len(questions) == 0 {
		return utils.ErrNoQuestions
	}
	return nil
}

func (s *examService) ensureExamWindow(competitionID string) error {
	competition, err := s.competitions.FindByID(competitionID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if now.Before(competition.StartTime.UTC()) {
		return utils.ErrExamNotStarted
	}
	if !now.Before(competition.EndTime.UTC()) {
		return utils.ErrExamClosed
	}
	return nil
}
