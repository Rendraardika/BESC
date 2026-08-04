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
}

func (r *adminDashboardRepository) Participant(id string) (*entities.User, error) {
	return NewUserRepository(r.db).FindByID(id)
}

func (r *adminDashboardRepository) DeleteParticipant(id string) error {
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
		LIMIT 50
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
