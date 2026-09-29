package services

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"

	"online-competition-platform/config"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
)

type AdminDashboardService interface {
	Summary() (*entities.AdminDashboard, error)
	Participants() ([]entities.User, error)
	Participant(id string) (*entities.User, error)
	DeleteParticipant(id string) error
	Payments() ([]entities.AdminDashboardActivity, error)
	UpdateRegistrationStatus(registrationID, status string) error
}

func (s *adminDashboardService) Payments() ([]entities.AdminDashboardActivity, error) {
	return s.repository.Payments()
}

func (s *adminDashboardService) UpdateRegistrationStatus(registrationID, status string) error {
	email, participantName, competitionTitle, err := s.repository.RegistrationNotificationDetails(registrationID)
	if err != nil {
		return err
	}
	if err := s.repository.UpdateRegistrationStatus(registrationID, status); err != nil {
		return err
	}
	if status != entities.SelectionSemifinalist &&
		status != entities.SelectionEliminated &&
		status != entities.SelectionFinalist &&
		status != entities.SelectionNotFinalist {
		return nil
	}
	go func() {
		if err := sendSelectionStatusEmail(s.cfg, email, participantName, competitionTitle, status); err != nil {
			log.Printf("registration status updated but selection email failed for registration %s: %v", registrationID, err)
		}
	}()
	return nil
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
	cfg        config.Config
}

func NewAdminDashboardService(repository repositories.AdminDashboardRepository, cfg config.Config) AdminDashboardService {
	return &adminDashboardService{repository: repository, cfg: cfg}
}

func (s *adminDashboardService) Summary() (*entities.AdminDashboard, error) {
	return s.repository.Summary()
}

func sendSelectionStatusEmail(cfg config.Config, recipient, participantName, competitionTitle, status string) error {
	if cfg.SMTPHost == "" || cfg.SMTPUser == "" || cfg.SMTPPass == "" {
		return fmt.Errorf("smtp is not configured")
	}

	subject := "Hasil Seleksi Penyisihan BESC"
	message := ""
	if status == entities.SelectionSemifinalist {
		subject = "Selamat, Kamu Lolos ke Semifinal BESC"
		message = "Halo " + participantName + ",\r\n\r\nSelamat! Kamu dinyatakan lolos tahap penyisihan " + competitionTitle + " dan berhak mengikuti tahap semifinal.\r\n\r\nSilakan masuk ke akun BESC kamu untuk melihat jadwal dan informasi tahap semifinal. Akses pengerjaan akan terbuka sesuai jadwal yang ditetapkan panitia.\r\n\r\nTerima kasih,\r\nTim BESC"
	} else if status == entities.SelectionEliminated {
		subject = "Hasil Seleksi Penyisihan BESC"
		message = "Halo " + participantName + ",\r\n\r\nTerima kasih telah mengikuti tahap penyisihan " + competitionTitle + ". Mohon maaf, kali ini kamu belum dapat melanjutkan ke tahap semifinal.\r\n\r\nTetap semangat dan terus kembangkan kemampuanmu. Kami berharap dapat bertemu kembali di kegiatan BESC berikutnya.\r\n\r\nTerima kasih,\r\nTim BESC"
	} else if status == entities.SelectionFinalist {
		subject = "Selamat, Kamu Lolos ke Final BESC"
		message = "Halo " + participantName + ",\r\n\r\nSelamat! Kamu dinyatakan lolos tahap semifinal " + competitionTitle + " dan berhak mengikuti tahap final.\r\n\r\nTahap final dilaksanakan secara offline. Informasi lokasi, waktu, dan ketentuan pelaksanaan akan disampaikan oleh panitia BESC. Tidak ada ujian final yang perlu dikerjakan melalui website.\r\n\r\nTerima kasih,\r\nTim BESC"
	} else if status == entities.SelectionNotFinalist {
		subject = "Hasil Seleksi Semifinal BESC"
		message = "Halo " + participantName + ",\r\n\r\nTerima kasih telah mengikuti tahap semifinal " + competitionTitle + ". Mohon maaf, kali ini kamu belum dapat melanjutkan ke tahap final.\r\n\r\nTetap semangat dan terus kembangkan kemampuanmu. Kami berharap dapat bertemu kembali di kegiatan BESC berikutnya.\r\n\r\nTerima kasih,\r\nTim BESC"
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
	cleanPass := strings.ReplaceAll(strings.TrimSpace(cfg.SMTPPass), " ", "")
	auth := smtp.PlainAuth("", cfg.SMTPUser, cleanPass, cfg.SMTPHost)
	return smtp.SendMail(cfg.SMTPHost+":"+cfg.SMTPPort, auth, cfg.SMTPUser, []string{recipient}, body)
}
