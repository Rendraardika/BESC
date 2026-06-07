package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
	"online-competition-platform/internal/utils"
)

type AuthService interface {
	Register(input dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(input dto.LoginRequest) (*dto.AuthResponse, error)
	GoogleLogin(input dto.GoogleLoginRequest) (*dto.AuthResponse, error)
	CurrentUser(userID string) (*entities.User, error)
	UpdateProfile(userID string, input dto.UpdateProfileRequest) (*entities.User, error)
}

func (s *authService) UpdateProfile(userID string, input dto.UpdateProfileRequest) (*entities.User, error) {
	birthDate, err := time.Parse("2006-01-02", input.BirthDate)
	if err != nil {
		return nil, utils.ErrInvalidInput
	}
	user := &entities.User{
		ID: userID, Name: input.Name, Phone: input.Phone, Institution: input.Institution,
		Photo: input.Photo, BirthDate: &birthDate, Gender: input.Gender, Province: input.Province, City: input.City,
	}
	if err := s.users.UpdateFullProfile(user); err != nil {
		return nil, err
	}
	return s.users.FindByID(userID)
}

type authService struct {
	users repositories.UserRepository
	cfg   config.Config
}

func NewAuthService(users repositories.UserRepository, cfg config.Config) AuthService {
	return &authService{users: users, cfg: cfg}
}

func (s *authService) Register(input dto.RegisterRequest) (*dto.AuthResponse, error) {
	hashed, err := utils.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	user := &entities.User{
		ID:          uuid.NewString(),
		Name:        input.Name,
		Email:       strings.ToLower(input.Email),
		Password:    hashed,
		Role:        entities.RoleUser,
		Phone:       input.Phone,
		Institution: input.Institution,
	}
	if err := s.users.Create(user); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return nil, utils.ErrConflict
		}
		return nil, err
	}

	token, err := utils.GenerateToken(user.ID, user.Role, s.cfg.JWTSecret, s.cfg.JWTExpires)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{Token: token, User: user}, nil
}

func (s *authService) Login(input dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.users.FindByEmail(strings.ToLower(input.Email))
	if err != nil {
		return nil, utils.ErrUnauthorized
	}
	if !utils.CheckPassword(user.Password, input.Password) {
		return nil, utils.ErrUnauthorized
	}
	token, err := utils.GenerateToken(user.ID, user.Role, s.cfg.JWTSecret, s.cfg.JWTExpires)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{Token: token, User: user}, nil
}

func (s *authService) GoogleLogin(input dto.GoogleLoginRequest) (*dto.AuthResponse, error) {
	if s.cfg.GoogleClientID == "" {
		return nil, errors.New("google client id is not configured")
	}

	profile, err := verifyGoogleCredential(input.Credential, s.cfg.GoogleClientID)
	if err != nil {
		return nil, utils.ErrUnauthorized
	}

	email := strings.ToLower(profile.Email)
	user, err := s.users.FindByEmail(email)
	if err != nil {
		randomPassword, hashErr := utils.HashPassword(uuid.NewString())
		if hashErr != nil {
			return nil, hashErr
		}
		user = &entities.User{
			ID:       uuid.NewString(),
			Name:     profile.Name,
			Email:    email,
			Password: randomPassword,
			Role:     entities.RoleUser,
		}
		if createErr := s.users.Create(user); createErr != nil {
			return nil, createErr
		}
	}

	token, err := utils.GenerateToken(user.ID, user.Role, s.cfg.JWTSecret, s.cfg.JWTExpires)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{Token: token, User: user}, nil
}

func (s *authService) CurrentUser(userID string) (*entities.User, error) {
	return s.users.FindByID(userID)
}

type googleTokenInfo struct {
	Audience      string `json:"aud"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
}

func verifyGoogleCredential(credential string, clientID string) (*googleTokenInfo, error) {
	resp, err := http.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + credential)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google token verification failed: %s", resp.Status)
	}

	var profile googleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return nil, err
	}
	if profile.Audience != clientID || profile.Email == "" || profile.EmailVerified != "true" {
		return nil, utils.ErrUnauthorized
	}
	if profile.Name == "" {
		profile.Name = profile.Email
	}
	return &profile, nil
}
