package services

import (
	"errors"
	"testing"
	"time"

	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

func TestProctoringRejectsEventForAnotherUserSubmission(t *testing.T) {
	proctoring := &proctoringRepositoryFake{}
	service := NewProctoringService(
		&proctoringSubmissionRepository{submission: startedSubmission("submission-b", "user-b")},
		proctoring,
	)

	_, err := service.LogEvent("user-a", proctoringEventRequest("submission-b", "tab_switch", "count=999"), "127.0.0.1", "test-agent")
	if !errors.Is(err, utils.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
	if proctoring.eventCreates != 0 {
		t.Fatalf("expected no event creation, got %d", proctoring.eventCreates)
	}
}

func TestProctoringRejectsSnapshotForAnotherUserSubmission(t *testing.T) {
	proctoring := &proctoringRepositoryFake{}
	service := NewProctoringService(
		&proctoringSubmissionRepository{submission: startedSubmission("submission-b", "user-b")},
		proctoring,
	)

	_, err := service.SaveSnapshot("user-a", "submission-b", "private/proctoring/submission-b/snapshot.jpg")
	if !errors.Is(err, utils.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
	if proctoring.snapshotCreates != 0 {
		t.Fatalf("expected no snapshot creation, got %d", proctoring.snapshotCreates)
	}
}

func TestProctoringRejectsSubmittedSubmission(t *testing.T) {
	service := NewProctoringService(
		&proctoringSubmissionRepository{submission: &entities.Submission{
			ID:     "submission-1",
			UserID: "user-1",
			Status: entities.SubmissionSubmitted,
		}},
		&proctoringRepositoryFake{},
	)

	_, err := service.LogEvent("user-1", proctoringEventRequest("submission-1", "tab_switch", ""), "127.0.0.1", "test-agent")
	if !errors.Is(err, utils.ErrExamSubmitted) {
		t.Fatalf("expected ErrExamSubmitted, got %v", err)
	}
}

func TestProctoringRejectsUnsupportedEventType(t *testing.T) {
	proctoring := &proctoringRepositoryFake{}
	service := NewProctoringService(
		&proctoringSubmissionRepository{submission: startedSubmission("submission-1", "user-1")},
		proctoring,
	)

	_, err := service.LogEvent("user-1", proctoringEventRequest("submission-1", "hack_event", ""), "127.0.0.1", "test-agent")
	if !errors.Is(err, utils.ErrInvalidInput) {
		t.Fatalf("expected ErrInvalidInput, got %v", err)
	}
	if proctoring.eventCreates != 0 {
		t.Fatalf("expected no event creation, got %d", proctoring.eventCreates)
	}
}

func TestProctoringEventCounterIsServerSide(t *testing.T) {
	proctoring := &proctoringRepositoryFake{nextViolationCount: 1}
	service := NewProctoringService(
		&proctoringSubmissionRepository{submission: startedSubmission("submission-1", "user-1")},
		proctoring,
	)

	event, err := service.LogEvent("user-1", proctoringEventRequest("submission-1", "tab_switch", "frontend_count=999"), "127.0.0.1", "test-agent")
	if err != nil {
		t.Fatalf("expected event to be logged, got %v", err)
	}
	if event.ViolationCount != 1 {
		t.Fatalf("expected server-side violation count 1, got %d", event.ViolationCount)
	}
	if proctoring.lastCountAsViolation != true {
		t.Fatal("expected tab_switch to count as violation")
	}
}

func TestProctoringThrottlesRepeatedEventsAndSnapshots(t *testing.T) {
	proctoring := &proctoringRepositoryFake{recentEvent: true, recentSnapshot: true}
	service := NewProctoringService(
		&proctoringSubmissionRepository{submission: startedSubmission("submission-1", "user-1")},
		proctoring,
	)

	_, err := service.LogEvent("user-1", proctoringEventRequest("submission-1", "copy_attempt", ""), "127.0.0.1", "test-agent")
	if !errors.Is(err, utils.ErrConflict) {
		t.Fatalf("expected ErrConflict for repeated event, got %v", err)
	}
	_, err = service.SaveSnapshot("user-1", "submission-1", "private/proctoring/submission-1/snapshot.jpg")
	if !errors.Is(err, utils.ErrConflict) {
		t.Fatalf("expected ErrConflict for repeated snapshot, got %v", err)
	}
	if proctoring.eventCreates != 0 || proctoring.snapshotCreates != 0 {
		t.Fatalf("expected throttled writes to be skipped, got events=%d snapshots=%d", proctoring.eventCreates, proctoring.snapshotCreates)
	}
}

func startedSubmission(id, userID string) *entities.Submission {
	return &entities.Submission{
		ID:     id,
		UserID: userID,
		Status: entities.SubmissionStarted,
	}
}

func proctoringEventRequest(submissionID, eventType, metadata string) dto.ProctoringEventRequest {
	return dto.ProctoringEventRequest{SubmissionID: submissionID, EventType: eventType, Metadata: metadata}
}

type proctoringSubmissionRepository struct {
	submission *entities.Submission
}

func (r *proctoringSubmissionRepository) Start(submission *entities.Submission) error {
	return nil
}

func (r *proctoringSubmissionRepository) FindByID(id string) (*entities.Submission, error) {
	if r.submission == nil || r.submission.ID != id {
		return nil, utils.ErrNotFound
	}
	return r.submission, nil
}

func (r *proctoringSubmissionRepository) FindActive(userID, competitionID string) (*entities.Submission, error) {
	return nil, utils.ErrNotFound
}

func (r *proctoringSubmissionRepository) Submit(submissionID string, answers []entities.Answer, score float64) error {
	return nil
}

func (r *proctoringSubmissionRepository) List(page, limit int) ([]entities.Submission, int, error) {
	return nil, 0, nil
}

func (r *proctoringSubmissionRepository) ListDetails(page, limit int) ([]entities.SubmissionDetail, int, error) {
	return nil, 0, nil
}

type proctoringRepositoryFake struct {
	recentEvent          bool
	recentSnapshot       bool
	nextViolationCount   int
	lastCountAsViolation bool
	eventCreates         int
	snapshotCreates      int
}

func (r *proctoringRepositoryFake) CreateEvent(event *entities.ProctoringEvent, countAsViolation bool) error {
	r.eventCreates++
	r.lastCountAsViolation = countAsViolation
	if countAsViolation {
		if r.nextViolationCount == 0 {
			r.nextViolationCount = 1
		}
		event.ViolationCount = r.nextViolationCount
	}
	return nil
}

func (r *proctoringRepositoryFake) CreateSnapshot(snapshot *entities.ProctoringSnapshot) error {
	r.snapshotCreates++
	return nil
}

func (r *proctoringRepositoryFake) FindSnapshotByID(snapshotID string) (*entities.ProctoringSnapshot, error) {
	return nil, utils.ErrNotFound
}

func (r *proctoringRepositoryFake) HasRecentEvent(submissionID, eventType string, since time.Time) (bool, error) {
	return r.recentEvent, nil
}

func (r *proctoringRepositoryFake) HasRecentSnapshot(submissionID string, since time.Time) (bool, error) {
	return r.recentSnapshot, nil
}

func (r *proctoringRepositoryFake) ListEvents(submissionID string, page, limit int) ([]entities.ProctoringEvent, int, error) {
	return nil, 0, nil
}

func (r *proctoringRepositoryFake) ListSnapshots(submissionID string, page, limit int) ([]entities.ProctoringSnapshot, int, error) {
	return nil, 0, nil
}

func (r *proctoringRepositoryFake) Summary(submissionID string) (*entities.ProctoringSummary, error) {
	return nil, nil
}
