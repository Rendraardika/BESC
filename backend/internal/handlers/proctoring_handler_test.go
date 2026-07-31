package handlers

import (
	"bytes"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"online-competition-platform/config"
	"online-competition-platform/internal/dto"
	"online-competition-platform/internal/entities"
)

func TestProctoringLogEventRejectsUnsupportedEventType(t *testing.T) {
	service := &proctoringServiceFake{}
	app := proctoringTestApp(service)

	req := httptest.NewRequest(fiber.MethodPost, "/proctoring/events", bytes.NewBufferString(`{
		"submission_id": "11111111-1111-1111-1111-111111111111",
		"event_type": "hack_event"
	}`))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	if service.logCalls != 0 {
		t.Fatalf("expected invalid event not to reach service, got %d calls", service.logCalls)
	}
}

func TestProctoringLogEventAcceptsTabSwitch(t *testing.T) {
	service := &proctoringServiceFake{
		event: &entities.ProctoringEvent{
			ID:             "event-1",
			SubmissionID:   "11111111-1111-1111-1111-111111111111",
			UserID:         "user-1",
			EventType:      "tab_switch",
			ViolationCount: 1,
		},
	}
	app := proctoringTestApp(service)

	req := httptest.NewRequest(fiber.MethodPost, "/proctoring/events", bytes.NewBufferString(`{
		"submission_id": "11111111-1111-1111-1111-111111111111",
		"event_type": "tab_switch",
		"metadata": "visibilitychange"
	}`))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.StatusCode)
	}
	if service.logCalls != 1 {
		t.Fatalf("expected one service call, got %d", service.logCalls)
	}
}

func proctoringTestApp(service *proctoringServiceFake) *fiber.App {
	handler := NewProctoringHandler(service, config.Config{})
	app := fiber.New()
	app.Post("/proctoring/events", func(c *fiber.Ctx) error {
		c.Locals("user_id", "user-1")
		return handler.LogEvent(c)
	})
	return app
}

type proctoringServiceFake struct {
	event    *entities.ProctoringEvent
	logCalls int
}

func (s *proctoringServiceFake) LogEvent(userID string, input dto.ProctoringEventRequest, ipAddress, userAgent string) (*entities.ProctoringEvent, error) {
	s.logCalls++
	if s.event != nil {
		return s.event, nil
	}
	return &entities.ProctoringEvent{ID: "event-1", SubmissionID: input.SubmissionID, UserID: userID, EventType: input.EventType}, nil
}

func (s *proctoringServiceFake) SaveSnapshot(userID, submissionID, imagePath string) (*entities.ProctoringSnapshot, error) {
	return nil, nil
}

func (s *proctoringServiceFake) SnapshotPath(snapshotID string) (string, error) {
	return "", nil
}

func (s *proctoringServiceFake) Events(submissionID string, page, limit int) ([]entities.ProctoringEvent, int, error) {
	return nil, 0, nil
}

func (s *proctoringServiceFake) Snapshots(submissionID string, page, limit int) ([]entities.ProctoringSnapshot, int, error) {
	return nil, 0, nil
}

func (s *proctoringServiceFake) Summary(submissionID string) (*entities.ProctoringSummary, error) {
	return nil, nil
}
