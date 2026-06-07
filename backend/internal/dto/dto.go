package dto

import "time"

type RegisterRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,min=8,password_strength"`
	Phone       string `json:"phone" validate:"omitempty,max=30"`
	Institution string `json:"institution" validate:"omitempty,max=150"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type GoogleLoginRequest struct {
	Credential string `json:"credential" validate:"required"`
}

type UpdateProfileRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Phone       string `json:"phone" validate:"required,max=30"`
	Institution string `json:"institution" validate:"required,max=150"`
	Photo       string `json:"photo" validate:"required"`
	BirthDate   string `json:"birth_date" validate:"required"`
	Gender      string `json:"gender" validate:"required,max=30"`
	Province    string `json:"province" validate:"required,max=100"`
	City        string `json:"city" validate:"required,max=100"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

type CompetitionRequest struct {
	Title                string     `json:"title" validate:"required,max=200"`
	Slug                 string     `json:"slug" validate:"required,max=220"`
	Description          string     `json:"description" validate:"required"`
	Banner               string     `json:"banner" validate:"omitempty,max=255"`
	Price                float64    `json:"price" validate:"gte=0"`
	StartTime            time.Time  `json:"start_time" validate:"required"`
	EndTime              time.Time  `json:"end_time" validate:"required"`
	Status               string     `json:"status" validate:"required,oneof=draft published closed"`
	Category             string     `json:"category" validate:"required,max=100"`
	Level                string     `json:"level" validate:"required,max=50"`
	Badges               string     `json:"badges" validate:"omitempty,max=255"`
	Quota                int        `json:"quota" validate:"gte=0"`
	OriginalPrice        float64    `json:"original_price" validate:"gte=0"`
	RegistrationDeadline *time.Time `json:"registration_deadline"`
	DurationMinutes      int        `json:"duration_minutes" validate:"gte=1,lte=600"`
	TabSwitchLimit       int        `json:"tab_switch_limit" validate:"gte=1,lte=20"`
}

type QuestionRequest struct {
	Question      string  `json:"question" validate:"required"`
	OptionA       string  `json:"option_a" validate:"required"`
	OptionB       string  `json:"option_b" validate:"required"`
	OptionC       string  `json:"option_c" validate:"required"`
	OptionD       string  `json:"option_d" validate:"required"`
	CorrectAnswer string  `json:"correct_answer" validate:"required,oneof=A B C D"`
	Score         float64 `json:"score" validate:"required,gt=0"`
}

type VerifyPaymentRequest struct {
	Status string `json:"status" validate:"required,oneof=verified rejected"`
}

type SubmitExamRequest struct {
	Answers []AnswerRequest `json:"answers" validate:"required,min=1,dive"`
}

type AnswerRequest struct {
	QuestionID string `json:"question_id" validate:"required,uuid"`
	Answer     string `json:"answer" validate:"required,oneof=A B C D"`
}

type SubmissionResult struct {
	SubmissionID string  `json:"submission_id"`
	Score        float64 `json:"score"`
	Status       string  `json:"status"`
}

type ProctoringEventRequest struct {
	SubmissionID string `json:"submission_id" validate:"required,uuid"`
	EventType    string `json:"event_type" validate:"required,oneof=page_leave tab_switch fullscreen_exit camera_off camera_on copy_attempt right_click screenshot_attempt devtools_attempt"`
	Metadata     string `json:"metadata" validate:"omitempty,max=1000"`
}
