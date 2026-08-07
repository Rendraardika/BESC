package repositories

import (
	"database/sql"
	"errors"

	"github.com/google/uuid"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

type UserRepository interface {
	Create(user *entities.User) error
	FindByID(id string) (*entities.User, error)
	FindByEmail(email string) (*entities.User, error)
	UpdateProfile(id, name, phone, institution string) error
	UpdateFullProfile(user *entities.User) error
	Delete(id string) error
	CreatePasswordReset(email, token string, expiresAt interface{}) error
	FindPasswordReset(token string) (email string, expiresAt interface{}, used bool, err error)
	MarkPasswordResetUsed(token string) error
	UpdatePasswordByEmail(email, hashedPassword string) error
}

func (r *userRepository) UpdateProfile(id, name, phone, institution string) error {
	result, err := r.db.Exec(`UPDATE users SET name = ?, phone = ?, institution = ? WHERE id = ?`, name, phone, institution, id)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *userRepository) UpdateFullProfile(user *entities.User) error {
	result, err := r.db.Exec(`UPDATE users SET name = ?, phone = ?, institution = ?, team_name = ?, member1_name = ?, member2_name = ?, photo = ?, birth_date = ?, gender = ?, province = ?, city = ? WHERE id = ?`,
		user.Name, user.Phone, user.Institution, user.TeamName, user.Member1Name, user.Member2Name, user.Photo, user.BirthDate, user.Gender, user.Province, user.City, user.ID)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *userRepository) Delete(id string) error {
	result, err := r.db.Exec(`DELETE FROM users WHERE id = ? AND role = 'user'`, id)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *entities.User) error {
	query := `INSERT INTO users (id, name, email, password, role, phone, institution, team_name, member1_name, member2_name, birth_date, gender, province, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.Exec(query, user.ID, user.Name, user.Email, user.Password, user.Role, user.Phone, user.Institution, user.TeamName, user.Member1Name, user.Member2Name, user.BirthDate, user.Gender, user.Province, user.City)
	if err != nil {
		return err
	}
	return nil
}

func (r *userRepository) FindByID(id string) (*entities.User, error) {
	query := `SELECT id, name, email, password, role, phone, institution, COALESCE(photo, ''), birth_date, gender, province, city, team_name, member1_name, member2_name, created_at FROM users WHERE id = ?`
	return scanUser(r.db.QueryRow(query, id))
}

func (r *userRepository) FindByEmail(email string) (*entities.User, error) {
	query := `SELECT id, name, email, password, role, phone, institution, COALESCE(photo, ''), birth_date, gender, province, city, team_name, member1_name, member2_name, created_at FROM users WHERE email = ?`
	return scanUser(r.db.QueryRow(query, email))
}

func scanUser(row *sql.Row) (*entities.User, error) {
	var user entities.User
	if err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.Role, &user.Phone, &user.Institution, &user.Photo, &user.BirthDate, &user.Gender, &user.Province, &user.City, &user.TeamName, &user.Member1Name, &user.Member2Name, &user.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	user.RefreshProfileComplete()
	return &user, nil
}

// Password reset methods

func (r *userRepository) CreatePasswordReset(email, token string, expiresAt interface{}) error {
	_, err := r.db.Exec(
		"INSERT INTO password_resets (id, email, token, expires_at) VALUES (?, ?, ?, ?)",
		uuid.NewString(), email, token, expiresAt,
	)
	return err
}

func (r *userRepository) FindPasswordReset(token string) (string, interface{}, bool, error) {
	var email string
	var expiresAt string
	var used int
	err := r.db.QueryRow("SELECT email, expires_at, used FROM password_resets WHERE token = ?", token).Scan(&email, &expiresAt, &used)
	if err != nil {
		return "", nil, false, err
	}
	return email, expiresAt, used == 1, nil
}

func (r *userRepository) MarkPasswordResetUsed(token string) error {
	_, err := r.db.Exec("UPDATE password_resets SET used = 1 WHERE token = ?", token)
	return err
}

func (r *userRepository) UpdatePasswordByEmail(email, hashedPassword string) error {
	_, err := r.db.Exec("UPDATE users SET password = ? WHERE email = ?", hashedPassword, email)
	return err
}
