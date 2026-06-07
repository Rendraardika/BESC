package services

import (
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
)

type AdminDashboardService interface {
	Summary() (*entities.AdminDashboard, error)
	Participants() ([]entities.User, error)
	Participant(id string) (*entities.User, error)
	DeleteParticipant(id string) error
}

func (s *adminDashboardService) Participant(id string) (*entities.User, error) {
	return s.repository.Participant(id)
}

func (s *adminDashboardService) DeleteParticipant(id string) error {
	return s.repository.DeleteParticipant(id)
}

func (s *adminDashboardService) Participants() ([]entities.User, error) {
	return s.repository.Participants()
}

type adminDashboardService struct {
	repository repositories.AdminDashboardRepository
}

func NewAdminDashboardService(repository repositories.AdminDashboardRepository) AdminDashboardService {
	return &adminDashboardService{repository: repository}
}

func (s *adminDashboardService) Summary() (*entities.AdminDashboard, error) {
	return s.repository.Summary()
}
