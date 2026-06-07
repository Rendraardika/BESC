package repositories

import (
	"database/sql"
	"errors"

	"online-competition-platform/internal/entities"
	"online-competition-platform/internal/utils"
)

type CompetitionRepository interface {
	Create(item *entities.Competition) error
	Update(item *entities.Competition) error
	Delete(id string) error
	FindByID(id string) (*entities.Competition, error)
	FindBySlug(slug string) (*entities.Competition, error)
	List(page, limit int) ([]entities.Competition, int, error)
}

type competitionRepository struct {
	db *sql.DB
}

func NewCompetitionRepository(db *sql.DB) CompetitionRepository {
	return &competitionRepository{db: db}
}

func (r *competitionRepository) Create(item *entities.Competition) error {
	query := `INSERT INTO competitions (id, title, slug, description, banner, price, start_time, end_time, status, category, level, badges, quota, original_price, registration_deadline, duration_minutes, tab_switch_limit)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.Exec(query, item.ID, item.Title, item.Slug, item.Description, item.Banner, item.Price, item.StartTime, item.EndTime, item.Status, item.Category, item.Level, item.Badges, item.Quota, item.OriginalPrice, item.RegistrationDeadline, item.DurationMinutes, item.TabSwitchLimit)
	return err
}

func (r *competitionRepository) Update(item *entities.Competition) error {
	query := `UPDATE competitions SET title = ?, slug = ?, description = ?, banner = ?, price = ?, start_time = ?, end_time = ?, status = ?, category = ?, level = ?, badges = ?, quota = ?, original_price = ?, registration_deadline = ?, duration_minutes = ?, tab_switch_limit = ? WHERE id = ?`
	result, err := r.db.Exec(query, item.Title, item.Slug, item.Description, item.Banner, item.Price, item.StartTime, item.EndTime, item.Status, item.Category, item.Level, item.Badges, item.Quota, item.OriginalPrice, item.RegistrationDeadline, item.DurationMinutes, item.TabSwitchLimit, item.ID)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *competitionRepository) Delete(id string) error {
	result, err := r.db.Exec(`DELETE FROM competitions WHERE id = ?`, id)
	if err != nil {
		return err
	}
	return rowsAffected(result)
}

func (r *competitionRepository) FindByID(id string) (*entities.Competition, error) {
	return scanCompetition(r.db.QueryRow(`SELECT id, title, slug, description, banner, price, start_time, end_time, status, category, level, badges, quota, original_price, registration_deadline, duration_minutes, tab_switch_limit, created_at FROM competitions WHERE id = ?`, id))
}

func (r *competitionRepository) FindBySlug(slug string) (*entities.Competition, error) {
	return scanCompetition(r.db.QueryRow(`SELECT id, title, slug, description, banner, price, start_time, end_time, status, category, level, badges, quota, original_price, registration_deadline, duration_minutes, tab_switch_limit, created_at FROM competitions WHERE slug = ?`, slug))
}

func (r *competitionRepository) List(page, limit int) ([]entities.Competition, int, error) {
	offset := (page - 1) * limit
	var total int
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM competitions`).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.Query(`SELECT id, title, slug, description, banner, price, start_time, end_time, status, category, level, badges, quota, original_price, registration_deadline, duration_minutes, tab_switch_limit, created_at FROM competitions ORDER BY created_at DESC LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []entities.Competition{}
	for rows.Next() {
		var item entities.Competition
		if err := rows.Scan(&item.ID, &item.Title, &item.Slug, &item.Description, &item.Banner, &item.Price, &item.StartTime, &item.EndTime, &item.Status, &item.Category, &item.Level, &item.Badges, &item.Quota, &item.OriginalPrice, &item.RegistrationDeadline, &item.DurationMinutes, &item.TabSwitchLimit, &item.CreatedAt); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func scanCompetition(row *sql.Row) (*entities.Competition, error) {
	var item entities.Competition
	if err := row.Scan(&item.ID, &item.Title, &item.Slug, &item.Description, &item.Banner, &item.Price, &item.StartTime, &item.EndTime, &item.Status, &item.Category, &item.Level, &item.Badges, &item.Quota, &item.OriginalPrice, &item.RegistrationDeadline, &item.DurationMinutes, &item.TabSwitchLimit, &item.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, utils.ErrNotFound
		}
		return nil, err
	}
	return &item, nil
}

func rowsAffected(result sql.Result) error {
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return utils.ErrNotFound
	}
	return nil
}
