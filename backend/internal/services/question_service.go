package services

import (
	"github.com/google/uuid"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
)

type QuestionService interface {
	Create(competitionID string, input dto.QuestionRequest) (*entities.Question, error)
	Update(id string, input dto.QuestionRequest) (*entities.Question, error)
	Delete(id string) error
	List(competitionID string) ([]entities.Question, error)
}

type questionService struct {
	questions repositories.QuestionRepository
}

func NewQuestionService(questions repositories.QuestionRepository) QuestionService {
	return &questionService{questions: questions}
}

func (s *questionService) Create(competitionID string, input dto.QuestionRequest) (*entities.Question, error) {
	question := &entities.Question{
		ID:            uuid.NewString(),
		CompetitionID: competitionID,
		Question:      input.Question,
		OptionA:       input.OptionA,
		OptionB:       input.OptionB,
		OptionC:       input.OptionC,
		OptionD:       input.OptionD,
		CorrectAnswer: input.CorrectAnswer,
		Score:         input.Score,
	}
	return question, s.questions.Create(question)
}

func (s *questionService) Update(id string, input dto.QuestionRequest) (*entities.Question, error) {
	existing, err := s.questions.FindByID(id)
	if err != nil {
		return nil, err
	}
	existing.Question = input.Question
	existing.OptionA = input.OptionA
	existing.OptionB = input.OptionB
	existing.OptionC = input.OptionC
	existing.OptionD = input.OptionD
	existing.CorrectAnswer = input.CorrectAnswer
	existing.Score = input.Score
	return existing, s.questions.Update(existing)
}

func (s *questionService) Delete(id string) error {
	return s.questions.Delete(id)
}

func (s *questionService) List(competitionID string) ([]entities.Question, error) {
	return s.questions.ListByCompetition(competitionID, true)
}
