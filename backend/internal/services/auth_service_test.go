package services

import (
	"testing"
	"time"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

func TestRegisterStoresProfileFields(t *testing.T) {
	users := &recordingUserRepository{}
	service := &authService{users: users, cfg: config.Config{JWTSecret: "test-secret", JWTExpires: time.Hour}}

	_, err := service.Register(dto.RegisterRequest{
		Name:        "Ayu",
		TeamName:    "Tim BESC",
		Email:       "ayu@example.com",
		Password:    "StrongPass123!",
		Phone:       "08123456789",
		Institution: "SMA BESC",
		BirthDate:   "2006-01-02",
		Gender:      "Perempuan",
		Province:    "Jawa Barat",
		City:        "Bandung",
	})
	if err != nil {
		t.Fatalf("expected register to succeed, got %v", err)
	}
	if len(users.createdUsers) != 1 {
		t.Fatalf("expected exactly one created user, got %d", len(users.createdUsers))
	}

	created := users.createdUsers[0]
	if created.Gender != "Perempuan" {
		t.Fatalf("expected gender to be stored, got %q", created.Gender)
	}
	if created.Province != "Jawa Barat" {
		t.Fatalf("expected province to be stored, got %q", created.Province)
	}
	if created.City != "Bandung" {
		t.Fatalf("expected city to be stored, got %q", created.City)
	}
	if created.BirthDate == nil || created.BirthDate.Format("2006-01-02") != "2006-01-02" {
		t.Fatalf("expected birth date to be stored, got %v", created.BirthDate)
	}
}

type recordingUserRepository struct {
	createdUsers []*entities.User
}

func (r *recordingUserRepository) Create(user *entities.User) error {
	r.createdUsers = append(r.createdUsers, user)
	return nil
}

func (r *recordingUserRepository) FindByID(id string) (*entities.User, error) {
	return nil, utils.ErrNotFound
}

func (r *recordingUserRepository) FindByEmail(email string) (*entities.User, error) {
	return nil, utils.ErrNotFound
}

func (r *recordingUserRepository) UpdateProfile(id, name, phone, institution string) error {
	return nil
}

func (r *recordingUserRepository) UpdateFullProfile(user *entities.User) error {
	return nil
}

func (r *recordingUserRepository) Delete(id string) error {
	return nil
}

func (r *recordingUserRepository) CreatePasswordReset(email, token string, expiresAt interface{}) error {
	return nil
}

func (r *recordingUserRepository) FindPasswordReset(token string) (string, interface{}, bool, error) {
	return "", nil, false, nil
}

func (r *recordingUserRepository) MarkPasswordResetUsed(token string) error {
	return nil
}

func (r *recordingUserRepository) UpdatePasswordByEmail(email, hashedPassword string) error {
	return nil
}
