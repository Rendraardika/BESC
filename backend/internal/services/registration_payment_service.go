package services

import (
	"fmt"
	"net/smtp"
	"path/filepath"
	"strings"

	"github.com/google/uuid"

	"online-competition-platform/config"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
	"online-competition-platform/internal/utils"
)

type RegistrationService interface {
	Register(userID, competitionID string) (*entities.Registration, error)
	MyCompetitions(userID string, page, limit int) ([]entities.RegistrationDetail, int, error)
}

type PaymentService interface {
	UploadProof(userID, registrationID, proofPath string) (*entities.Payment, error)
	Status(userID, registrationID string) (*entities.Payment, error)
	Verify(paymentID, status, adminID string) error
}

type registrationService struct {
	registrations repositories.RegistrationRepository
	competitions  repositories.CompetitionRepository
}

type paymentService struct {
	registrations repositories.RegistrationRepository
	payments      repositories.PaymentRepository
	cfg           config.Config
}

func NewRegistrationService(registrations repositories.RegistrationRepository, competitions repositories.CompetitionRepository) RegistrationService {
	return &registrationService{registrations: registrations, competitions: competitions}
}

func NewPaymentService(registrations repositories.RegistrationRepository, payments repositories.PaymentRepository, cfg config.Config) PaymentService {
	return &paymentService{registrations: registrations, payments: payments, cfg: cfg}
}

func (s *registrationService) Register(userID, competitionID string) (*entities.Registration, error) {
	if _, err := s.competitions.FindByID(competitionID); err != nil {
		return nil, err
	}
	if existing, err := s.registrations.FindByUserAndCompetition(userID, competitionID); err == nil {
		return existing, utils.ErrConflict
	}
	registration := &entities.Registration{
		ID:            uuid.NewString(),
		UserID:        userID,
		CompetitionID: competitionID,
		Status:        entities.RegistrationPending,
	}
	return registration, s.registrations.Create(registration)
}

func (s *registrationService) MyCompetitions(userID string, page, limit int) ([]entities.RegistrationDetail, int, error) {
	return s.registrations.ListByUser(userID, page, limit)
}

func (s *paymentService) UploadProof(userID, registrationID, proofPath string) (*entities.Payment, error) {
	registration, err := s.registrations.FindByID(registrationID)
	if err != nil {
		return nil, err
	}
	if registration.UserID != userID {
		return nil, utils.ErrForbidden
	}
	payment := &entities.Payment{
		ID:             uuid.NewString(),
		RegistrationID: registrationID,
		ProofImage:     filepath.ToSlash(proofPath),
		PaymentStatus:  entities.PaymentPending,
	}
	return payment, s.payments.Upsert(payment)
}

func (s *paymentService) Status(userID, registrationID string) (*entities.Payment, error) {
	registration, err := s.registrations.FindByID(registrationID)
	if err != nil {
		return nil, err
	}
	if registration.UserID != userID {
		return nil, utils.ErrForbidden
	}
	return s.payments.FindByRegistrationID(registrationID)
}

func (s *paymentService) Verify(paymentID, status, adminID string) error {
	status = strings.ToLower(status)
	email, competitionTitle, err := s.payments.NotificationDetails(paymentID)
	if err != nil {
		return err
	}
	if err := s.payments.UpdateStatus(paymentID, status, adminID); err != nil {
		return err
	}
	return sendPaymentStatusEmail(s.cfg, email, competitionTitle, status)
}

func sendPaymentStatusEmail(cfg config.Config, recipient, competitionTitle, status string) error {
	if cfg.SMTPHost == "" || cfg.SMTPUser == "" || cfg.SMTPPass == "" {
		return fmt.Errorf("smtp is not configured")
	}
	subject := "Status Pembayaran BESC"
	message := "Pembayaran kamu untuk " + competitionTitle + " telah " + status + "."
	if status == entities.PaymentVerified {
		message = "Selamat, pembayaran kamu untuk " + competitionTitle + " telah diverifikasi. Pendaftaran kompetisi kamu telah aktif."
	} else if status == entities.PaymentRejected {
		message = "Pembayaran kamu untuk " + competitionTitle + " ditolak. Silakan periksa kembali bukti pembayaran dan hubungi admin BESC."
	}
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
