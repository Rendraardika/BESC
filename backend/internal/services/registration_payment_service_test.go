package services

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

func TestRegistrationRequiresCompleteProfile(t *testing.T) {
	registrations := &profileRegistrationRepository{}
	service := NewRegistrationService(
		registrations,
		&profileCompetitionRepository{competition: &entities.Competition{ID: "competition-1", Status: entities.CompetitionPublished}},
		&profileUserRepository{user: &entities.User{ID: "user-1", Name: "Peserta", Email: "peserta@example.com"}},
	)

	_, err := service.Register("user-1", "competition-1")
	if !errors.Is(err, utils.ErrProfileIncomplete) {
		t.Fatalf("expected ErrProfileIncomplete, got %v", err)
	}
	if registrations.created != nil {
		t.Fatal("registration should not be created for incomplete profile")
	}
}

func TestRegistrationUsesAuthenticatedUserProfile(t *testing.T) {
	birthDate := time.Date(2006, 1, 2, 0, 0, 0, 0, time.UTC)
	user := &entities.User{
		ID:          "auth-user",
		Name:        "Peserta BESC",
		Email:       "peserta@example.com",
		Phone:       "08123456789",
		Institution: "SMA BESC",
		Photo:       "data:image/png;base64,abc",
		BirthDate:   &birthDate,
		Gender:      "Perempuan",
		Province:    "Jawa Tengah",
		City:        "Semarang",
	}
	user.RefreshProfileComplete()

	registrations := &profileRegistrationRepository{}
	service := NewRegistrationService(
		registrations,
		&profileCompetitionRepository{competition: &entities.Competition{ID: "competition-1", Status: entities.CompetitionPublished}},
		&profileUserRepository{user: user},
	)

	registration, err := service.Register("auth-user", "competition-1")
	if err != nil {
		t.Fatalf("expected registration to succeed, got %v", err)
	}
	if registration.UserID != "auth-user" {
		t.Fatalf("expected authenticated user id, got %s", registration.UserID)
	}
	if registrations.created == nil {
		t.Fatal("expected registration to be persisted")
	}
}

func TestRegistrationRejectsClosedDeadline(t *testing.T) {
	deadline := time.Now().Add(-time.Minute)
	user := completeProfileUser("auth-user")
	registrations := &profileRegistrationRepository{}
	service := NewRegistrationService(
		registrations,
		&profileCompetitionRepository{competition: &entities.Competition{
			ID:                   "competition-1",
			Status:               entities.CompetitionPublished,
			RegistrationDeadline: &deadline,
		}},
		&profileUserRepository{user: user},
	)

	_, err := service.Register("auth-user", "competition-1")
	if !errors.Is(err, utils.ErrRegistrationClosed) {
		t.Fatalf("expected ErrRegistrationClosed, got %v", err)
	}
	if registrations.created != nil {
		t.Fatal("registration should not be created after deadline")
	}
}

func TestRegistrationRejectsUnpublishedCompetition(t *testing.T) {
	user := completeProfileUser("auth-user")
	registrations := &profileRegistrationRepository{}
	service := NewRegistrationService(
		registrations,
		&profileCompetitionRepository{competition: &entities.Competition{ID: "competition-1", Status: entities.CompetitionDraft}},
		&profileUserRepository{user: user},
	)

	_, err := service.Register("auth-user", "competition-1")
	if !errors.Is(err, utils.ErrRegistrationClosed) {
		t.Fatalf("expected ErrRegistrationClosed, got %v", err)
	}
	if registrations.created != nil {
		t.Fatal("registration should not be created for unpublished competition")
	}
}

func completeProfileUser(id string) *entities.User {
	birthDate := time.Date(2006, 1, 2, 0, 0, 0, 0, time.UTC)
	user := &entities.User{
		ID:          id,
		Name:        "Peserta BESC",
		Email:       "peserta@example.com",
		Phone:       "08123456789",
		Institution: "SMA BESC",
		Photo:       "data:image/png;base64,abc",
		BirthDate:   &birthDate,
		Gender:      "Perempuan",
		Province:    "Jawa Tengah",
		City:        "Semarang",
	}
	user.RefreshProfileComplete()
	return user
}

type profileRegistrationRepository struct {
	created *entities.Registration
}

func (r *profileRegistrationRepository) Create(registration *entities.Registration) error {
	r.created = registration
	return nil
}

func (r *profileRegistrationRepository) FindByUserAndCompetition(userID, competitionID string) (*entities.Registration, error) {
	return nil, utils.ErrNotFound
}

func (r *profileRegistrationRepository) FindByID(id string) (*entities.Registration, error) {
	return nil, utils.ErrNotFound
}

func (r *profileRegistrationRepository) ListByUser(userID string, page, limit int) ([]entities.RegistrationDetail, int, error) {
	return nil, 0, nil
}

func (r *profileRegistrationRepository) UpdateStatusTx(tx *sql.Tx, registrationID, status string) error {
	return nil
}

type profileCompetitionRepository struct {
	competition *entities.Competition
}

func (r *profileCompetitionRepository) Create(item *entities.Competition) error {
	return nil
}

func (r *profileCompetitionRepository) Update(item *entities.Competition) error {
	return nil
}

func (r *profileCompetitionRepository) Delete(id string) error {
	return nil
}

func (r *profileCompetitionRepository) FindByID(id string) (*entities.Competition, error) {
	if r.competition == nil {
		return nil, utils.ErrNotFound
	}
	return r.competition, nil
}

func (r *profileCompetitionRepository) FindBySlug(slug string) (*entities.Competition, error) {
	return nil, utils.ErrNotFound
}

func (r *profileCompetitionRepository) List(page, limit int) ([]entities.Competition, int, error) {
	return nil, 0, nil
}

type profileUserRepository struct {
	user *entities.User
}

func (r *profileUserRepository) Create(user *entities.User) error {
	return nil
}

func (r *profileUserRepository) FindByID(id string) (*entities.User, error) {
	if r.user == nil || r.user.ID != id {
		return nil, utils.ErrNotFound
	}
	return r.user, nil
}

func (r *profileUserRepository) FindByEmail(email string) (*entities.User, error) {
	return nil, utils.ErrNotFound
}

func (r *profileUserRepository) UpdateProfile(id, name, phone, institution string) error {
	return nil
}

func (r *profileUserRepository) UpdateFullProfile(user *entities.User) error {
	r.user = user
	return nil
}

func (r *profileUserRepository) Delete(id string) error {
	return nil
}

func (r *profileUserRepository) CreatePasswordReset(email, token string, expiresAt interface{}) error {
	return nil
}

func (r *profileUserRepository) FindPasswordReset(token string) (string, interface{}, bool, error) {
	return "", nil, false, nil
}

func (r *profileUserRepository) MarkPasswordResetUsed(token string) error {
	return nil
}

func (r *profileUserRepository) UpdatePasswordByEmail(email, hashedPassword string) error {
	return nil
}
