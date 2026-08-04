package repositories

import (
	"database/sql"
	"errors"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

type TeamRepository interface {
	Create(team *entities.Team) error
	Update(team *entities.Team) error
	Delete(id string) error
	FindByID(id string) (*entities.Team, error)
	List() ([]entities.Team, error)
}

type teamRepository struct {
	db *sql.DB
}

func NewTeamRepository(db *sql.DB) TeamRepository {
	return &teamRepository{db: db}
}

func (r *teamRepository) Create(team *entities.Team) error {
	query := `INSERT INTO teams (id, name, leader_name, leader_email, leader_phone, member1_name, member1_email, member2_name, member2_email, institution, category, status, notes)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.Exec(query, team.ID, team.Name, team.LeaderName, team.LeaderEmail, team.LeaderPhone,
		team.Member1Name, team.Member1Email, team.Member2Name, team.Member2Email,
		team.Institution, team.Category, team.Status, team.Notes)
	return err
}

func (r *teamRepository) Update(team *entities.Team) error {
	query := `UPDATE teams SET name = ?, leader_name = ?, leader_email = ?, leader_phone = ?, member1_name = ?, member1_email = ?, member2_name = ?, member2_email = ?, institution = ?, category = ?, status = ?, notes = ? WHERE id = ?`
	result, err := r.db.Exec(query, team.Name, team.LeaderName, team.LeaderEmail, team.LeaderPhone,
		team.Member1Name, team.Member1Email, team.Member2Name, team.Member2Email,
		team.Institution, team.Category, team.Status, team.Notes, team.ID)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *teamRepository) Delete(id string) error {
	result, err := r.db.Exec(`DELETE FROM teams WHERE id = ?`, id)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *teamRepository) FindByID(id string) (*entities.Team, error) {
	team := &entities.Team{}
	err := r.db.QueryRow(`SELECT id, name, leader_name, leader_email, leader_phone, member1_name, member1_email, member2_name, member2_email, institution, category, status, COALESCE(notes, ''), created_at, updated_at FROM teams WHERE id = ?`, id).
		Scan(&team.ID, &team.Name, &team.LeaderName, &team.LeaderEmail, &team.LeaderPhone,
			&team.Member1Name, &team.Member1Email, &team.Member2Name, &team.Member2Email,
			&team.Institution, &team.Category, &team.Status, &team.Notes, &team.CreatedAt, &team.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return team, nil
}

func (r *teamRepository) List() ([]entities.Team, error) {
	rows, err := r.db.Query(`SELECT id, name, leader_name, leader_email, leader_phone, member1_name, member1_email, member2_name, member2_email, institution, category, status, COALESCE(notes, ''), created_at, updated_at FROM teams ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []entities.Team{}
	for rows.Next() {
		var item entities.Team
		if err := rows.Scan(&item.ID, &item.Name, &item.LeaderName, &item.LeaderEmail, &item.LeaderPhone,
			&item.Member1Name, &item.Member1Email, &item.Member2Name, &item.Member2Email,
			&item.Institution, &item.Category, &item.Status, &item.Notes, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
