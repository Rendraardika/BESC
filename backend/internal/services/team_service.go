package services

import (
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
)

type TeamService interface {
	Create(team *entities.Team) error
	Update(team *entities.Team) error
	Delete(id string) error
	FindByID(id string) (*entities.Team, error)
	List() ([]entities.Team, error)
}

type teamService struct {
	repository repositories.TeamRepository
}

func NewTeamService(repository repositories.TeamRepository) TeamService {
	return &teamService{repository: repository}
}

func (s *teamService) Create(team *entities.Team) error {
	return s.repository.Create(team)
}

func (s *teamService) Update(team *entities.Team) error {
	return s.repository.Update(team)
}

func (s *teamService) Delete(id string) error {
	return s.repository.Delete(id)
}

func (s *teamService) FindByID(id string) (*entities.Team, error) {
	return s.repository.FindByID(id)
}

func (s *teamService) List() ([]entities.Team, error) {
	return s.repository.List()
}
