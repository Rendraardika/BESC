package services

import (
	"strings"

	"github.com/google/uuid"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
)

type CompetitionService interface {
	Create(input dto.CompetitionRequest) (*entities.Competition, error)
	Update(id string, input dto.CompetitionRequest) (*entities.Competition, error)
	Delete(id string) error
	Get(idOrSlug string) (*entities.Competition, error)
	List(page, limit int) ([]entities.Competition, int, error)
}

type competitionService struct {
	competitions repositories.CompetitionRepository
}

func NewCompetitionService(competitions repositories.CompetitionRepository) CompetitionService {
	return &competitionService{competitions: competitions}
}

func (s *competitionService) Create(input dto.CompetitionRequest) (*entities.Competition, error) {
	item := &entities.Competition{
		ID:          uuid.NewString(),
		Title:       input.Title,
		Slug:        input.Slug,
		Description: input.Description,
		Banner:      input.Banner,
		Price:       input.Price,
		StartTime:   input.StartTime,
		EndTime:     input.EndTime,
		Status:      input.Status,
		Category:    input.Category, Level: input.Level, Badges: input.Badges, Quota: input.Quota,
		OriginalPrice: input.OriginalPrice, RegistrationDeadline: input.RegistrationDeadline,
		DurationMinutes: input.DurationMinutes, TabSwitchLimit: input.TabSwitchLimit,
	}
	return item, s.competitions.Create(item)
}

func (s *competitionService) Update(id string, input dto.CompetitionRequest) (*entities.Competition, error) {
	item := &entities.Competition{
		ID:          id,
		Title:       input.Title,
		Slug:        input.Slug,
		Description: input.Description,
		Banner:      input.Banner,
		Price:       input.Price,
		StartTime:   input.StartTime,
		EndTime:     input.EndTime,
		Status:      input.Status,
		Category:    input.Category, Level: input.Level, Badges: input.Badges, Quota: input.Quota,
		OriginalPrice: input.OriginalPrice, RegistrationDeadline: input.RegistrationDeadline,
		DurationMinutes: input.DurationMinutes, TabSwitchLimit: input.TabSwitchLimit,
	}
	return item, s.competitions.Update(item)
}

func (s *competitionService) Delete(id string) error {
	return s.competitions.Delete(id)
}

func (s *competitionService) Get(idOrSlug string) (*entities.Competition, error) {
	if strings.Contains(idOrSlug, "-") && len(idOrSlug) == 36 {
		return s.competitions.FindByID(idOrSlug)
	}
	return s.competitions.FindBySlug(idOrSlug)
}

func (s *competitionService) List(page, limit int) ([]entities.Competition, int, error) {
	return s.competitions.List(page, limit)
}
