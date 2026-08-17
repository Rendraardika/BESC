package services

import (
	"errors"
	"fmt"
	"log"
	"net/smtp"
	"path/filepath"
	"strings"
	"time"

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
	ProofPath(paymentID string) (string, error)
	MarkProofViewed(paymentID, adminID string) error
}

type registrationService struct {
	registrations repositories.RegistrationRepository
	competitions  repositories.CompetitionRepository
	users         repositories.UserRepository
}

type paymentService struct {
	registrations repositories.RegistrationRepository
	payments      repositories.PaymentRepository
	cfg           config.Config
}

func NewRegistrationService(registrations repositories.RegistrationRepository, competitions repositories.CompetitionRepository, users repositories.UserRepository) RegistrationService {
	return &registrationService{registrations: registrations, competitions: competitions, users: users}
}

func NewPaymentService(registrations repositories.RegistrationRepository, payments repositories.PaymentRepository, cfg config.Config) PaymentService {
	return &paymentService{registrations: registrations, payments: payments, cfg: cfg}
}

func normalizeCategory(category string) string {
	c := strings.ToLower(strings.TrimSpace(category))
	switch {
	case strings.Contains(c, "try out"):
		return "try out"
	case strings.Contains(c, "lkti") || strings.Contains(c, "karya tulis"):
		return "lkti"
	case strings.Contains(c, "olimpiade"):
		return "olimpiade"
	default:
		return c
	}
}

func (s *registrationService) Register(userID, competitionID string) (*entities.Registration, error) {
	competition, err := s.competitions.FindByID(competitionID)
	if err != nil {
		return nil, err
	}
	if competition.Status != entities.CompetitionPublished {
		return nil, utils.ErrRegistrationClosed
	}
	if competition.RegistrationDeadline != nil && time.Now().After(*competition.RegistrationDeadline) {
		return nil, utils.ErrRegistrationClosed
	}
	user, err := s.users.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if !user.ProfileComplete {
		return nil, utils.ErrProfileIncomplete
	}
	if existing, err := s.registrations.FindByUserAndCompetition(userID, competitionID); err == nil {
		return existing, nil
	}

	// Check category restrictions: Olimpiade and LKTI are mutually exclusive.
	// Different Olimpiade levels (SMA/SMP) remain allowed, but Try Out can be registered alongside anything.
	competitionCategory := normalizeCategory(competition.Category)
	if competitionCategory != "try out" {
		userRegistrations, _, err := s.registrations.ListByUser(userID, 1, 100)
		if err == nil {
			for _, reg := range userRegistrations {
				existingComp, err := s.competitions.FindBySlug(reg.CompetitionSlug)
				if err == nil {
					existingCategory := normalizeCategory(existingComp.Category)
					if existingCategory == "try out" || competitionCategory == "try out" {
						continue
					}
					if existingCategory == "olimpiade" && competitionCategory == "lkti" {
						return nil, fmt.Errorf("Anda sudah mendaftar kategori %s. Anda tidak bisa mendaftar kategori %s secara bersamaan", existingComp.Category, competition.Category)
					}
					if existingCategory == "lkti" && competitionCategory == "olimpiade" {
						return nil, fmt.Errorf("Anda sudah mendaftar kategori %s. Anda tidak bisa mendaftar kategori %s secara bersamaan", existingComp.Category, competition.Category)
					}
				}
			}
		}
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
	existingPayment, err := s.payments.FindByRegistrationID(registrationID)
	if err == nil && existingPayment.PaymentStatus == entities.PaymentVerified {
		return existingPayment, nil
	}
	if err != nil && !errors.Is(err, utils.ErrNotFound) {
		return nil, err
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
	var email, competitionTitle string
	var err error
	if status != entities.PaymentPending {
		email, competitionTitle, err = s.payments.NotificationDetails(paymentID)
		if err != nil {
			return err
		}
	}
	if err := s.payments.UpdateStatus(paymentID, status, adminID); err != nil {
		return err
	}
	if status == entities.PaymentPending {
		return nil
	}
	if err := sendPaymentStatusEmail(s.cfg, email, competitionTitle, status); err != nil {
		log.Printf("payment status updated but notification email failed for payment %s: %v", paymentID, err)
	}
	return nil
}

func (s *paymentService) ProofPath(paymentID string) (string, error) {
	payment, err := s.payments.FindByID(paymentID)
	if err != nil {
		return "", err
	}
	return payment.ProofImage, nil
}

func (s *paymentService) MarkProofViewed(paymentID, adminID string) error {
	return s.payments.MarkProofViewed(paymentID, adminID)
}

func sendPaymentStatusEmail(cfg config.Config, recipient, competitionTitle, status string) error {
	if cfg.SMTPHost == "" || cfg.SMTPUser == "" || cfg.SMTPPass == "" {
		return fmt.Errorf("smtp is not configured")
	}
	subject := "Status Pembayaran BESC"
	message := ""
	if status == entities.PaymentVerified {
		subject = "Pembayaran BESC Diverifikasi"
		message = "Halo,\r\n\r\nSelamat, pembayaran kamu untuk " + competitionTitle + " telah diverifikasi.\r\n\r\nPendaftaran kompetisi kamu sekarang aktif. Silakan cek akun BESC kamu untuk melihat status pendaftaran dan informasi kompetisi.\r\n\r\nTerima kasih,\r\nTim BESC"
	} else if status == entities.PaymentRejected {
		subject = "Pembayaran BESC Ditolak"
		message = "Halo,\r\n\r\nMohon maaf, bukti pembayaran kamu untuk " + competitionTitle + " belum dapat diverifikasi.\r\n\r\nSilakan periksa kembali bukti pembayaran yang diunggah. Jika ada kekeliruan, unggah ulang bukti pembayaran atau hubungi admin BESC untuk bantuan.\r\n\r\nTerima kasih,\r\nTim BESC"
	} else {
		return nil
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
