package entities

import "time"

const (
	RoleUser  = "user"
	RoleAdmin = "admin"

	RegistrationPending  = "pending"
	RegistrationVerified = "verified"
	RegistrationRejected = "rejected"

	PaymentPending  = "pending"
	PaymentVerified = "verified"
	PaymentRejected = "rejected"

	CompetitionDraft     = "draft"
	CompetitionPublished = "published"
	CompetitionClosed    = "closed"

	SubmissionStarted   = "started"
	SubmissionSubmitted = "submitted"
)

type User struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Email       string     `json:"email"`
	Password    string     `json:"-"`
	Role        string     `json:"role"`
	Phone       string     `json:"phone"`
	Institution string     `json:"institution"`
	TeamName    string     `json:"team_name"`
	Member1Name string     `json:"member1_name"`
	Member2Name string     `json:"member2_name"`
	Photo       string     `json:"photo,omitempty"`
	BirthDate   *time.Time `json:"birth_date,omitempty"`
	Gender      string     `json:"gender"`
	Province    string     `json:"province"`
	City        string     `json:"city"`
	CreatedAt   time.Time  `json:"created_at"`
}

type Competition struct {
	ID                   string     `json:"id"`
	Title                string     `json:"title"`
	Slug                 string     `json:"slug"`
	Description          string     `json:"description"`
	Banner               string     `json:"banner"`
	Price                float64    `json:"price"`
	StartTime            time.Time  `json:"start_time"`
	EndTime              time.Time  `json:"end_time"`
	Status               string     `json:"status"`
	Category             string     `json:"category"`
	Level                string     `json:"level"`
	Badges               string     `json:"badges"`
	Quota                int        `json:"quota"`
	OriginalPrice        float64    `json:"original_price"`
	RegistrationDeadline *time.Time `json:"registration_deadline,omitempty"`
	DurationMinutes      int        `json:"duration_minutes"`
	TabSwitchLimit       int        `json:"tab_switch_limit"`
	CreatedAt            time.Time  `json:"created_at"`
}

type Registration struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	CompetitionID string    `json:"competition_id"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

type RegistrationDetail struct {
	Registration
	CompetitionTitle string `json:"competition_title"`
	CompetitionSlug  string `json:"competition_slug"`
	PaymentStatus    string `json:"payment_status,omitempty"`
	ProofImage       string `json:"proof_image,omitempty"`
}

type Payment struct {
	ID             string     `json:"id"`
	RegistrationID string     `json:"registration_id"`
	ProofImage     string     `json:"proof_image"`
	PaymentStatus  string     `json:"payment_status"`
	ValidatedBy    *string    `json:"validated_by,omitempty"`
	ValidatedAt    *time.Time `json:"validated_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
}

type Question struct {
	ID            string  `json:"id"`
	CompetitionID string  `json:"competition_id"`
	Question      string  `json:"question"`
	OptionA       string  `json:"option_a"`
	OptionB       string  `json:"option_b"`
	OptionC       string  `json:"option_c"`
	OptionD       string  `json:"option_d"`
	CorrectAnswer string  `json:"correct_answer,omitempty"`
	Score         float64 `json:"score"`
}

type Submission struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id"`
	CompetitionID  string     `json:"competition_id"`
	StartedAt      time.Time  `json:"started_at"`
	SubmittedAt    *time.Time `json:"submitted_at,omitempty"`
	Score          float64    `json:"score"`
	Status         string     `json:"status"`
	ViolationCount int        `json:"violation_count"`
}

type SubmissionDetail struct {
	Submission
	UserName         string `json:"user_name"`
	UserEmail        string `json:"user_email"`
	CompetitionTitle string `json:"competition_title"`
	CorrectCount     int    `json:"correct_count"`
	WrongCount       int    `json:"wrong_count"`
	TotalQuestions   int    `json:"total_questions"`
}

type Answer struct {
	ID           string `json:"id"`
	SubmissionID string `json:"submission_id"`
	QuestionID   string `json:"question_id"`
	Answer       string `json:"answer"`
}

type ProctoringEvent struct {
	ID           string    `json:"id"`
	SubmissionID string    `json:"submission_id"`
	UserID       string    `json:"user_id"`
	EventType    string    `json:"event_type"`
	Metadata     string    `json:"metadata,omitempty"`
	IPAddress    string    `json:"ip_address,omitempty"`
	UserAgent    string    `json:"user_agent,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type ProctoringSnapshot struct {
	ID           string    `json:"id"`
	SubmissionID string    `json:"submission_id"`
	UserID       string    `json:"user_id"`
	ImagePath    string    `json:"image_path"`
	CapturedAt   time.Time `json:"captured_at"`
}

type ProctoringSummary struct {
	SubmissionID   string `json:"submission_id"`
	EventCount     int    `json:"event_count"`
	SnapshotCount  int    `json:"snapshot_count"`
	ViolationCount int    `json:"violation_count"`
}

type AdminDashboardActivity struct {
	ID               string    `json:"id"`
	PaymentID        string    `json:"payment_id"`
	UserName         string    `json:"user_name"`
	UserEmail        string    `json:"user_email"`
	UserPhoto        string    `json:"user_photo"`
	CompetitionTitle string    `json:"competition_title"`
	Status           string    `json:"status"`
	PaymentStatus    string    `json:"payment_status"`
	ProofImage       string    `json:"proof_image"`
	CreatedAt        time.Time `json:"created_at"`
}

type AdminDashboard struct {
	TotalParticipants  int                      `json:"total_participants"`
	ActiveCompetitions int                      `json:"active_competitions"`
	PendingPayments    int                      `json:"pending_payments"`
	TotalRegistrations int                      `json:"total_registrations"`
	RecentActivities   []AdminDashboardActivity `json:"recent_activities"`
}
