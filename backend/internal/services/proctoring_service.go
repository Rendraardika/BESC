package services

import (
	"path/filepath"
	"time"

	"github.com/google/uuid"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/repositories"
	"online-competition-platform/internal/utils"
)

const (
	minProctoringEventInterval    = 1 * time.Second
	minProctoringSnapshotInterval = 30 * time.Second
)

type ProctoringService interface {
	LogEvent(userID string, input dto.ProctoringEventRequest, ipAddress, userAgent string) (*entities.ProctoringEvent, error)
	SaveSnapshot(userID, submissionID, imagePath string) (*entities.ProctoringSnapshot, error)
	SnapshotPath(snapshotID string) (string, error)
	Events(submissionID string, page, limit int) ([]entities.ProctoringEvent, int, error)
	Snapshots(submissionID string, page, limit int) ([]entities.ProctoringSnapshot, int, error)
	Summary(submissionID string) (*entities.ProctoringSummary, error)
}

type proctoringService struct {
	submissions repositories.SubmissionRepository
	proctoring  repositories.ProctoringRepository
}

func NewProctoringService(submissions repositories.SubmissionRepository, proctoring repositories.ProctoringRepository) ProctoringService {
	return &proctoringService{submissions: submissions, proctoring: proctoring}
}

func (s *proctoringService) LogEvent(userID string, input dto.ProctoringEventRequest, ipAddress, userAgent string) (*entities.ProctoringEvent, error) {
	if !dto.IsAllowedProctoringEventType(input.EventType) {
		return nil, utils.ErrInvalidInput
	}

	submission, err := s.submissions.FindByID(input.SubmissionID)
	if err != nil {
		return nil, err
	}
	if submission.UserID != userID {
		return nil, utils.ErrForbidden
	}
	if submission.Status != entities.SubmissionStarted {
		return nil, utils.ErrExamSubmitted
	}
	recent, err := s.proctoring.HasRecentEvent(input.SubmissionID, input.EventType, time.Now().Add(-minProctoringEventInterval))
	if err != nil {
		return nil, err
	}
	if recent {
		return nil, utils.ErrConflict
	}

	event := &entities.ProctoringEvent{
		ID:           uuid.NewString(),
		SubmissionID: input.SubmissionID,
		UserID:       userID,
		EventType:    input.EventType,
		Metadata:     input.Metadata,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
	}
	if err := s.proctoring.CreateEvent(event, isViolationEvent(input.EventType)); err != nil {
		return nil, err
	}
	return event, nil
}

func (s *proctoringService) SaveSnapshot(userID, submissionID, imagePath string) (*entities.ProctoringSnapshot, error) {
	submission, err := s.submissions.FindByID(submissionID)
	if err != nil {
		return nil, err
	}
	if submission.UserID != userID {
		return nil, utils.ErrForbidden
	}
	if submission.Status != entities.SubmissionStarted {
		return nil, utils.ErrExamSubmitted
	}
	recent, err := s.proctoring.HasRecentSnapshot(submissionID, time.Now().Add(-minProctoringSnapshotInterval))
	if err != nil {
		return nil, err
	}
	if recent {
		return nil, utils.ErrConflict
	}

	snapshot := &entities.ProctoringSnapshot{
		ID:           uuid.NewString(),
		SubmissionID: submissionID,
		UserID:       userID,
		ImagePath:    filepath.ToSlash(imagePath),
		CapturedAt:   time.Now(),
	}
	if err := s.proctoring.CreateSnapshot(snapshot); err != nil {
		return nil, err
	}
	return snapshot, nil
}

func (s *proctoringService) SnapshotPath(snapshotID string) (string, error) {
	snapshot, err := s.proctoring.FindSnapshotByID(snapshotID)
	if err != nil {
		return "", err
	}
	return snapshot.ImagePath, nil
}

func (s *proctoringService) Events(submissionID string, page, limit int) ([]entities.ProctoringEvent, int, error) {
	if _, err := s.submissions.FindByID(submissionID); err != nil {
		return nil, 0, err
	}
	return s.proctoring.ListEvents(submissionID, page, limit)
}

func (s *proctoringService) Snapshots(submissionID string, page, limit int) ([]entities.ProctoringSnapshot, int, error) {
	if _, err := s.submissions.FindByID(submissionID); err != nil {
		return nil, 0, err
	}
	return s.proctoring.ListSnapshots(submissionID, page, limit)
}

func (s *proctoringService) Summary(submissionID string) (*entities.ProctoringSummary, error) {
	if _, err := s.submissions.FindByID(submissionID); err != nil {
		return nil, err
	}
	return s.proctoring.Summary(submissionID)
}

func isViolationEvent(eventType string) bool {
	return eventType != "camera_on"
}
