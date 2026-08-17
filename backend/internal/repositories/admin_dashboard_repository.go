package repositories

import (
	"database/sql"

	"online-competition-platform/internal/entities"
)

type AdminDashboardRepository interface {
	Summary() (*entities.AdminDashboard, error)
	Participants() ([]entities.User, error)
	Participant(id string) (*entities.User, error)
	DeleteParticipant(id string) error
	Payments() ([]entities.AdminDashboardActivity, error)
}

func (r *adminDashboardRepository) Participant(id string) (*entities.User, error) {
	return NewUserRepository(r.db).FindByID(id)
}

func (r *adminDashboardRepository) DeleteParticipant(id string) error {
	// Cascade delete related data before deleting the user
	// 1. Delete team documents related to user's registrations
	r.db.Exec(`DELETE rd FROM registration_documents rd JOIN registrations r ON r.id = rd.registration_id WHERE r.user_id = ?`, id)
	// 2. Delete proctoring snapshots related to user's submissions
	r.db.Exec(`DELETE ps FROM proctoring_snapshots ps JOIN submissions s ON s.id = ps.submission_id WHERE s.user_id = ?`, id)
	// 3. Delete proctoring events related to user's submissions
	r.db.Exec(`DELETE pe FROM proctoring_events pe JOIN submissions s ON s.id = pe.submission_id WHERE s.user_id = ?`, id)
	// 4. Delete answers related to user's submissions
	r.db.Exec(`DELETE a FROM answers a JOIN submissions s ON s.id = a.submission_id WHERE s.user_id = ?`, id)
	// 5. Delete submissions (this also cascades to answers, proctoring via FK)
	r.db.Exec(`DELETE FROM submissions WHERE user_id = ?`, id)
	// 6. Delete payments related to user's registrations
	r.db.Exec(`DELETE p FROM payments p JOIN registrations r ON r.id = p.registration_id WHERE r.user_id = ?`, id)
	// 7. Delete registrations
	r.db.Exec(`DELETE FROM registrations WHERE user_id = ?`, id)
	// 8. Delete teams (ON DELETE SET NULL won't auto-delete, so manually delete)
	r.db.Exec(`DELETE FROM teams WHERE user_id = ?`, id)
	// 9. Finally delete the user
	return NewUserRepository(r.db).Delete(id)
}

type adminDashboardRepository struct {
	db *sql.DB
}

func (r *adminDashboardRepository) Participants() ([]entities.User, error) {
	rows, err := r.db.Query(`SELECT id, name, email, password, role, phone, institution, COALESCE(photo, ''), birth_date, gender, province, city, COALESCE(team_name, ''), COALESCE(member1_name, ''), COALESCE(member2_name, ''), created_at FROM users WHERE role = 'user' ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []entities.User{}
	for rows.Next() {
		var item entities.User
		if err := rows.Scan(&item.ID, &item.Name, &item.Email, &item.Password, &item.Role, &item.Phone, &item.Institution, &item.Photo, &item.BirthDate, &item.Gender, &item.Province, &item.City, &item.TeamName, &item.Member1Name, &item.Member2Name, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *adminDashboardRepository) Payments() ([]entities.AdminDashboardActivity, error) {
	rows, err := r.db.Query(`
		SELECT r.id, COALESCE(p.id, ''), u.name, u.email, COALESCE(u.photo, ''), c.title, r.status, COALESCE(p.payment_status, ''), COALESCE(p.proof_image, ''), p.proof_viewed_at, COALESCE(p.proof_viewed_by, ''), COALESCE(p.created_at, r.created_at)
		FROM registrations r
		JOIN users u ON u.id = r.user_id
		JOIN competitions c ON c.id = r.competition_id
		LEFT JOIN payments p ON p.registration_id = r.id
		ORDER BY COALESCE(p.created_at, r.created_at) DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []entities.AdminDashboardActivity{}
	for rows.Next() {
		var activity entities.AdminDashboardActivity
		if err := rows.Scan(&activity.ID, &activity.PaymentID, &activity.UserName, &activity.UserEmail, &activity.UserPhoto, &activity.CompetitionTitle, &activity.Status, &activity.PaymentStatus, &activity.ProofImage, &activity.ProofViewedAt, &activity.ProofViewedBy, &activity.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, activity)
	}
	return items, rows.Err()
}

func NewAdminDashboardRepository(db *sql.DB) AdminDashboardRepository {
	return &adminDashboardRepository{db: db}
}

func (r *adminDashboardRepository) TeamsFromRegistrations() ([]entities.Team, error) {
	rows, err := r.db.Query(`
		SELECT 
			COALESCE(r.competition_id, '') as comp_id,
			u.id as user_id,
			COALESCE(u.team_name, '') as name,
			u.name as leader_name,
			u.email as leader_email,
			COALESCE(u.phone, '') as leader_phone,
			COALESCE(u.member1_name, '') as member1_name,
			COALESCE(u.member2_name, '') as member2_name,
			COALESCE(u.institution, '') as institution,
			COALESCE(c.category, 'Umum') as category,
			r.status,
			COALESCE(c.title, '') as notes,
			r.created_at,
			r.created_at
		FROM registrations r
		JOIN users u ON u.id = r.user_id
		LEFT JOIN competitions c ON c.id = r.competition_id
		WHERE u.team_name != ''
		ORDER BY r.created_at DESC
		LIMIT 100
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []entities.Team{}
	for rows.Next() {
		var item entities.Team
		if err := rows.Scan(&item.UserID, &item.UserID, &item.Name, &item.LeaderName, &item.LeaderEmail, &item.LeaderPhone, &item.Member1Name, &item.Member2Name, &item.Institution, &item.Category, &item.Status, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *adminDashboardRepository) Summary() (*entities.AdminDashboard, error) {
	var dashboard entities.AdminDashboard
	err := r.db.QueryRow(`
		SELECT
			(SELECT COUNT(*) FROM users WHERE role = 'user'),
			(SELECT COUNT(*) FROM competitions WHERE status = 'published' AND end_time >= NOW()),
			(SELECT COUNT(*) FROM payments WHERE payment_status = 'pending'),
			(SELECT COUNT(*) FROM registrations)
	`).Scan(&dashboard.TotalParticipants, &dashboard.ActiveCompetitions, &dashboard.PendingPayments, &dashboard.TotalRegistrations)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(`
		SELECT r.id, COALESCE(p.id, ''), u.name, u.email, COALESCE(u.photo, ''), c.title, r.status, COALESCE(p.payment_status, ''), COALESCE(p.proof_image, ''), p.proof_viewed_at, COALESCE(p.proof_viewed_by, ''), COALESCE(p.created_at, r.created_at)
		FROM registrations r
		JOIN users u ON u.id = r.user_id
		JOIN competitions c ON c.id = r.competition_id
		LEFT JOIN payments p ON p.registration_id = r.id
		ORDER BY COALESCE(p.created_at, r.created_at) DESC
		LIMIT 10
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	dashboard.RecentActivities = []entities.AdminDashboardActivity{}
	for rows.Next() {
		var activity entities.AdminDashboardActivity
		if err := rows.Scan(&activity.ID, &activity.PaymentID, &activity.UserName, &activity.UserEmail, &activity.UserPhoto, &activity.CompetitionTitle, &activity.Status, &activity.PaymentStatus, &activity.ProofImage, &activity.ProofViewedAt, &activity.ProofViewedBy, &activity.CreatedAt); err != nil {
			return nil, err
		}
		dashboard.RecentActivities = append(dashboard.RecentActivities, activity)
	}
	return &dashboard, rows.Err()
}
