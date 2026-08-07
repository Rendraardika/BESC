package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
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
	ForgotPassword(email string) error
	ResetPassword(token, password string) error
}

func (s *authService) UpdateProfile(userID string, input dto.UpdateProfileRequest) (*entities.User, error) {
	user, err := s.users.FindByID(userID)
	if err != nil {
		return nil, err
	}
	birthDate, err := time.Parse("2006-01-02", input.BirthDate)
	if err != nil {
		return nil, utils.ErrInvalidInput
	}
	user.Name = input.Name
	user.Phone = input.Phone
	user.Institution = input.Institution
	if input.TeamName != "" {
		user.TeamName = input.TeamName
	}
	if input.Member1Name != "" {
		user.Member1Name = input.Member1Name
	}
	if input.Member2Name != "" {
		user.Member2Name = input.Member2Name
	}
	user.Photo = input.Photo
	user.BirthDate = &birthDate
	user.Gender = input.Gender
	user.Province = input.Province
	user.City = input.City
	if err := s.users.UpdateFullProfile(user); err != nil {
		return nil, err
	}
	return s.users.FindByID(userID)
}

type authService struct {
	users                  repositories.UserRepository
	cfg                    config.Config
	verifyGoogleCredential googleCredentialVerifier
}

func NewAuthService(users repositories.UserRepository, cfg config.Config) AuthService {
	return &authService{users: users, cfg: cfg, verifyGoogleCredential: verifyGoogleCredential}
}

func (s *authService) Register(input dto.RegisterRequest) (*dto.AuthResponse, error) {
	hashed, err := utils.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	var birthDate *time.Time
	if strings.TrimSpace(input.BirthDate) != "" {
		parsedBirthDate, err := time.Parse("2006-01-02", input.BirthDate)
		if err != nil {
			return nil, utils.ErrInvalidInput
		}
		birthDate = &parsedBirthDate
	}

	user := &entities.User{
		ID:          uuid.NewString(),
		Name:        input.Name,
		Email:       strings.ToLower(input.Email),
		Password:    hashed,
		Role:        entities.RoleUser,
		Phone:       input.Phone,
		Institution: input.Institution,
		TeamName:    input.TeamName,
		Member1Name: input.Member1Name,
		Member2Name: input.Member2Name,
		BirthDate:   birthDate,
		Gender:      input.Gender,
		Province:    input.Province,
		City:        input.City,
	}
	if err := s.users.Create(user); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return nil, utils.ErrConflict
		}
		return nil, err
	}
	user.RefreshProfileComplete()

	return &dto.AuthResponse{User: user}, nil
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
		return nil, fmt.Errorf("%w: google client id is not configured", utils.ErrConfiguration)
	}

	profile, err := s.verifyGoogleCredential(input.Credential, s.cfg.GoogleClientID)
	if err != nil {
		if errors.Is(err, utils.ErrExternalService) {
			return nil, err
		}
		return nil, utils.ErrUnauthorized
	}

	email := strings.ToLower(profile.Email)
	user, err := s.users.FindByEmail(email)
	if err != nil && !errors.Is(err, utils.ErrNotFound) {
		return nil, err
	}
	if errors.Is(err, utils.ErrNotFound) {
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
			if strings.Contains(strings.ToLower(createErr.Error()), "duplicate") {
				user, err = s.users.FindByEmail(email)
				if err != nil {
					return nil, err
				}
			} else {
				return nil, createErr
			}
		} else {
			user.RefreshProfileComplete()
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
	Audience      string              `json:"aud"`
	Email         string              `json:"email"`
	EmailVerified googleEmailVerified `json:"email_verified"`
	Expiration    string              `json:"exp"`
	Issuer        string              `json:"iss"`
	Name          string              `json:"name"`
	Subject       string              `json:"sub"`
}

type googleCredentialVerifier func(credential string, clientID string) (*googleTokenInfo, error)

const defaultGoogleTokenInfoEndpoint = "https://oauth2.googleapis.com/tokeninfo"

var (
	googleTokenInfoEndpoint = defaultGoogleTokenInfoEndpoint
	googleHTTPClient        = &http.Client{Timeout: 5 * time.Second}
)

func verifyGoogleCredential(credential string, clientID string) (*googleTokenInfo, error) {
	req, err := http.NewRequest(http.MethodGet, googleTokenInfoEndpoint, nil)
	if err != nil {
		return nil, err
	}
	query := req.URL.Query()
	query.Set("id_token", credential)
	req.URL.RawQuery = query.Encode()

	resp, err := googleHTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: google token verification request failed", utils.ErrExternalService)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, utils.ErrUnauthorized
	}

	var profile googleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return nil, err
	}
	if !profile.validFor(clientID, time.Now()) {
		return nil, utils.ErrUnauthorized
	}
	if profile.Name == "" {
		profile.Name = profile.Email
	}
	return &profile, nil
}

func (p googleTokenInfo) validFor(clientID string, now time.Time) bool {
	if p.Audience != clientID || p.Email == "" || !bool(p.EmailVerified) || p.Subject == "" {
		return false
	}
	if p.Issuer != "accounts.google.com" && p.Issuer != "https://accounts.google.com" {
		return false
	}
	expiresAt, err := strconv.ParseInt(p.Expiration, 10, 64)
	if err != nil {
		return false
	}
	return now.Unix() < expiresAt
}

func (s *authService) ForgotPassword(email string) error {
	email = strings.ToLower(strings.TrimSpace(email))

	// Silently return even if user not found (security best practice)
	_, err := s.users.FindByEmail(email)
	if err != nil {
		return nil
	}

	token := uuid.NewString()
	expiresAt := time.Now().Add(30 * time.Minute)

	if err := s.users.CreatePasswordReset(email, token, expiresAt); err != nil {
		return err
	}

	if err := sendResetPasswordEmail(s.cfg, email, token); err != nil {
		return fmt.Errorf("gagal mengirim email: %v", err)
	}
	return nil
}

func (s *authService) ResetPassword(token, password string) error {
	email, _, used, err := s.users.FindPasswordReset(token)
	if err != nil {
		return utils.ErrNotFound
	}
	if used {
		return fmt.Errorf("token sudah digunakan")
	}
	hashed, err := utils.HashPassword(password)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePasswordByEmail(email, hashed); err != nil {
		return err
	}
	if err := s.users.MarkPasswordResetUsed(token); err != nil {
		return err
	}
	return nil
}

func sendResetPasswordEmail(cfg config.Config, recipient, token string) error {
	if cfg.SMTPHost == "" || cfg.SMTPUser == "" || cfg.SMTPPass == "" {
		return fmt.Errorf("smtp is not configured")
	}
	subject := "Reset Password BESC"
	resetURL := "https://beschimbio.online/#reset-password?token=" + token
	message := "Halo,\n\nKamu telah meminta reset password untuk akun BESC kamu.\n\nKlik link berikut untuk reset password (berlaku 30 menit):\n" + resetURL + "\n\nJika kamu tidak meminta ini, abaikan email ini.\n\nTerima kasih,\nTim BESC"

	from := cfg.MailFrom
	if from == "" {
		from = cfg.SMTPUser
	}
	body := []byte("From: " + from + "\r\n" +
		"To: " + recipient + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" + message)

	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPHost)
	return smtp.SendMail(cfg.SMTPHost+":"+cfg.SMTPPort, auth, cfg.SMTPUser, []string{recipient}, body)
}

type googleEmailVerified bool

func (v *googleEmailVerified) UnmarshalJSON(data []byte) error {
	var boolValue bool
	if err := json.Unmarshal(data, &boolValue); err == nil {
		*v = googleEmailVerified(boolValue)
		return nil
	}

	var stringValue string
	if err := json.Unmarshal(data, &stringValue); err == nil {
		parsed, parseErr := strconv.ParseBool(stringValue)
		if parseErr != nil {
			return parseErr
		}
		*v = googleEmailVerified(parsed)
		return nil
	}
	return fmt.Errorf("invalid email_verified value")
}
