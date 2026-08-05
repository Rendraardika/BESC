package entities

import (
	"strings"
	"time"
)

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
	ID              string     `json:"id"`
	Name            string     `json:"name"`
	Email           string     `json:"email"`
	Password        string     `json:"-"`
	Role            string     `json:"role"`
	Phone           string     `json:"phone"`
	Institution     string     `json:"institution"`
	TeamName        string     `json:"team_name"`
	Member1Name     string     `json:"member1_name"`
	Member2Name     string     `json:"member2_name"`
	Photo           string     `json:"photo,omitempty"`
	BirthDate       *time.Time `json:"birth_date,omitempty"`
	Gender          string     `json:"gender"`
	Province        string     `json:"province"`
	City            string     `json:"city"`
	CreatedAt       time.Time  `json:"created_at"`
	ProfileComplete bool       `json:"profile_complete"`
}

func (u *User) RefreshProfileComplete() {
	u.ProfileComplete = strings.TrimSpace(u.Name) != "" &&
		strings.TrimSpace(u.Email) != "" &&
		strings.TrimSpace(u.Phone) != "" &&
		strings.TrimSpace(u.Institution) != "" &&
		strings.TrimSpace(u.Photo) != "" &&
		u.BirthDate != nil &&
		strings.TrimSpace(u.Gender) != "" &&
		strings.TrimSpace(u.Province) != "" &&
		strings.TrimSpace(u.City) != ""
}

type Competition struct {
	ID                      string     `json:"id"`
	Title                   string     `json:"title"`
	Slug                    string     `json:"slug"`
	Description             string     `json:"description"`
	ParticipantRequirements string     `json:"participant_requirements,omitempty"`
	Banner                  string     `json:"banner"`
	Price                   float64    `json:"price"`
	StartTime               time.Time  `json:"start_time"`
	EndTime                 time.Time  `json:"end_time"`
	Status                  string     `json:"status"`
	Category                string     `json:"category"`
	Level                   string     `json:"level"`
	Badges                  string     `json:"badges"`
	Quota                   int        `json:"quota"`
	OriginalPrice           float64    `json:"original_price"`
	RegistrationDeadline    *time.Time `json:"registration_deadline,omitempty"`
	DurationMinutes         int        `json:"duration_minutes"`
	TabSwitchLimit          int        `json:"tab_switch_limit"`
	CreatedAt               time.Time  `json:"created_at"`
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
	ProofViewedAt  *time.Time `json:"proof_viewed_at,omitempty"`
	ProofViewedBy  *string    `json:"proof_viewed_by,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
}

type Question struct {
	ID            string  `json:"id"`
	CompetitionID string  `json:"competition_id"`
	Question      string  `json:"question"`
	Image         string  `json:"image,omitempty"`
	OptionA       string  `json:"option_a"`
	OptionB       string  `json:"option_b"`
	OptionC       string  `json:"option_c"`
	OptionD       string  `json:"option_d"`
	OptionE       string  `json:"option_e"`
	CorrectAnswer string  `json:"correct_answer,omitempty"`
	Score         float64 `json:"score"`
	WrongScore    float64 `json:"wrong_score"`
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
	UserName            string `json:"user_name"`
	UserEmail           string `json:"user_email"`
	CompetitionTitle    string `json:"competition_title"`
	CorrectCount        int    `json:"correct_count"`
	WrongCount          int    `json:"wrong_count"`
	AnsweredQuestions   int    `json:"answered_questions"`
	UnansweredQuestions int    `json:"unanswered_questions"`
	TotalQuestions      int    `json:"total_questions"`
	DurationSeconds     int    `json:"duration_seconds"`
}

type Answer struct {
	ID           string `json:"id"`
	SubmissionID string `json:"submission_id"`
	QuestionID   string `json:"question_id"`
	Answer       string `json:"answer"`
}

type ProctoringEvent struct {
	ID             string    `json:"id"`
	SubmissionID   string    `json:"submission_id"`
	UserID         string    `json:"user_id"`
	EventType      string    `json:"event_type"`
	Metadata       string    `json:"metadata,omitempty"`
	IPAddress      string    `json:"ip_address,omitempty"`
	UserAgent      string    `json:"user_agent,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	ViolationCount int       `json:"violation_count,omitempty"`
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
	ID               string     `json:"id"`
	PaymentID        string     `json:"payment_id"`
	UserName         string     `json:"user_name"`
	UserEmail        string     `json:"user_email"`
	UserPhoto        string     `json:"user_photo"`
	CompetitionTitle string     `json:"competition_title"`
	Status           string     `json:"status"`
	PaymentStatus    string     `json:"payment_status"`
	ProofImage       string     `json:"proof_image"`
	ProofViewedAt    *time.Time `json:"proof_viewed_at,omitempty"`
	ProofViewedBy    string     `json:"proof_viewed_by,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
}

type AdminDashboard struct {
	TotalParticipants  int                      `json:"total_participants"`
	ActiveCompetitions int                      `json:"active_competitions"`
	PendingPayments    int                      `json:"pending_payments"`
	TotalRegistrations int                      `json:"total_registrations"`
	RecentActivities   []AdminDashboardActivity `json:"recent_activities"`
}

type Team struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id,omitempty"`
	Name           string     `json:"name"`
	LeaderName     string     `json:"leader_name"`
	LeaderEmail    string     `json:"leader_email"`
	LeaderPhone    string     `json:"leader_phone"`
	LeaderNISN     string     `json:"leader_nisn,omitempty"`
	LeaderKelas    string     `json:"leader_kelas,omitempty"`
	LeaderIG       string     `json:"leader_ig,omitempty"`
	LeaderTikTok   string     `json:"leader_tiktok,omitempty"`
	Member1Name    string     `json:"member1_name"`
	Member1Email   string     `json:"member1_email"`
	Member1NISN    string     `json:"member1_nisn,omitempty"`
	Member1Kelas   string     `json:"member1_kelas,omitempty"`
	Member1IG      string     `json:"member1_ig,omitempty"`
	Member1TikTok  string     `json:"member1_tiktok,omitempty"`
	Member2Name    string     `json:"member2_name"`
	Member2Email   string     `json:"member2_email"`
	Member2NISN    string     `json:"member2_nisn,omitempty"`
	Member2Kelas   string     `json:"member2_kelas,omitempty"`
	Member2IG      string     `json:"member2_ig,omitempty"`
	Member2TikTok  string     `json:"member2_tiktok,omitempty"`
	Institution    string     `json:"institution"`
	Province       string     `json:"province,omitempty"`
	City           string     `json:"city,omitempty"`
	Address        string     `json:"address,omitempty"`
	GuardianName   string     `json:"guardian_name,omitempty"`
	GuardianHP     string     `json:"guardian_hp,omitempty"`
	GuardianEmail  string     `json:"guardian_email,omitempty"`
	Category       string     `json:"category"`
	Status         string     `json:"status"`
	Notes          string     `json:"notes,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}
