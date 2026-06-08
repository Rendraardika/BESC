package repositories

import (
	"database/sql"
	"errors"

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
	query := `INSERT INTO users (id, name, email, password, role, phone, institution, team_name, member1_name, member2_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.Exec(query, user.ID, user.Name, user.Email, user.Password, user.Role, user.Phone, user.Institution, user.TeamName, user.Member1Name, user.Member2Name)
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
	return &user, nil
}
