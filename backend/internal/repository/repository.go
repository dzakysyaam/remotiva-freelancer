package repository

import (
	"database/sql"
	"encoding/json"
	"strings"

	"remotiva/backend/internal/domain"
)

type Repository struct{ db *sql.DB }

func New(db *sql.DB) Repository { return Repository{db: db} }

func (r Repository) CreateUser(name, email, passwordHash, role string) (domain.User, error) {
	res, err := r.db.Exec("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)", name, email, passwordHash, role)
	if err != nil {
		return domain.User{}, err
	}
	id, _ := res.LastInsertId()
	return r.UserByID(id)
}

func (r Repository) UserByEmail(email string) (domain.User, string, error) {
	var u domain.User
	var hash string
	err := r.db.QueryRow("SELECT id,name,email,password_hash,role,created_at FROM users WHERE email=?", email).Scan(&u.ID, &u.Name, &u.Email, &hash, &u.Role, &u.CreatedAt)
	return u, hash, err
}

func (r Repository) UserByID(id int64) (domain.User, error) {
	var u domain.User
	err := r.db.QueryRow("SELECT id,name,email,role,created_at FROM users WHERE id=?", id).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt)
	return u, err
}

func (r Repository) Categories() ([]domain.Category, error) {
	rows, err := r.db.Query("SELECT id,name,slug,icon,description FROM categories ORDER BY sort_order,name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []domain.Category{}
	for rows.Next() {
		var item domain.Category
		if err := rows.Scan(&item.ID, &item.Name, &item.Slug, &item.Icon, &item.Description); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r Repository) Services(category, q string, limit int) ([]domain.Service, error) {
	args := []any{}
	where := []string{"1=1"}
	if category != "" {
		where = append(where, "c.slug=?")
		args = append(args, category)
	}
	if q != "" {
		where = append(where, "(s.title LIKE ? OR s.description LIKE ?)")
		term := "%" + q + "%"
		args = append(args, term, term)
	}
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	args = append(args, limit)
	query := `SELECT s.id,s.category_id,c.slug,s.seller_id,u.name,u.seller_level,s.title,s.description,s.image_url,s.price,s.rating,s.delivery_days,s.is_featured
		FROM services s JOIN categories c ON c.id=s.category_id JOIN users u ON u.id=s.seller_id
		WHERE ` + strings.Join(where, " AND ") + ` ORDER BY s.is_featured DESC, s.rating DESC LIMIT ?`
	return r.scanServices(query, args...)
}

func (r Repository) Service(id int64) (domain.Service, error) {
	items, err := r.scanServices(`SELECT s.id,s.category_id,c.slug,s.seller_id,u.name,u.seller_level,s.title,s.description,s.image_url,s.price,s.rating,s.delivery_days,s.is_featured
		FROM services s JOIN categories c ON c.id=s.category_id JOIN users u ON u.id=s.seller_id WHERE s.id=?`, id)
	if err != nil {
		return domain.Service{}, err
	}
	if len(items) == 0 {
		return domain.Service{}, sql.ErrNoRows
	}
	return items[0], nil
}

func (r Repository) scanServices(query string, args ...any) ([]domain.Service, error) {
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []domain.Service{}
	for rows.Next() {
		var s domain.Service
		if err := rows.Scan(&s.ID, &s.CategoryID, &s.CategorySlug, &s.SellerID, &s.SellerName, &s.SellerLevel, &s.Title, &s.Description, &s.ImageURL, &s.Price, &s.Rating, &s.DeliveryDays, &s.IsFeatured); err != nil {
			return nil, err
		}
		items = append(items, s)
	}
	return items, rows.Err()
}

func (r Repository) SaveService(userID, serviceID int64) error {
	_, err := r.db.Exec("INSERT IGNORE INTO saved_services(user_id,service_id) VALUES(?,?)", userID, serviceID)
	return err
}

func (r Repository) RemoveSaved(userID, serviceID int64) error {
	_, err := r.db.Exec("DELETE FROM saved_services WHERE user_id=? AND service_id=?", userID, serviceID)
	return err
}

func (r Repository) Saved(userID int64) ([]domain.Service, error) {
	return r.scanServices(`SELECT s.id,s.category_id,c.slug,s.seller_id,u.name,u.seller_level,s.title,s.description,s.image_url,s.price,s.rating,s.delivery_days,s.is_featured
		FROM saved_services sv JOIN services s ON s.id=sv.service_id JOIN categories c ON c.id=s.category_id JOIN users u ON u.id=s.seller_id WHERE sv.user_id=? ORDER BY sv.created_at DESC`, userID)
}

func (r Repository) CreateOrder(userID, serviceID int64, packageName string) error {
	var price float64
	if err := r.db.QueryRow("SELECT price FROM services WHERE id=?", serviceID).Scan(&price); err != nil {
		return err
	}
	_, err := r.db.Exec("INSERT INTO orders(user_id,service_id,package_name,status,total_price) VALUES(?,?,?,?,?)", userID, serviceID, packageName, "Pending", price)
	return err
}

func (r Repository) Orders(userID int64) ([]domain.Order, error) {
	rows, err := r.db.Query(`SELECT o.id,o.service_id,s.title,o.package_name,o.status,o.total_price,o.created_at FROM orders o JOIN services s ON s.id=o.service_id WHERE o.user_id=? ORDER BY o.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []domain.Order{}
	for rows.Next() {
		var item domain.Order
		if err := rows.Scan(&item.ID, &item.ServiceID, &item.ServiceTitle, &item.PackageName, &item.Status, &item.TotalPrice, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r Repository) Messages(userID int64) ([]domain.Message, error) {
	rows, err := r.db.Query("SELECT id,initial,sender_name,last_message,sent_at FROM messages WHERE user_id=? ORDER BY id DESC", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []domain.Message{}
	for rows.Next() {
		var item domain.Message
		if err := rows.Scan(&item.ID, &item.Initial, &item.SenderName, &item.LastMessage, &item.SentAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r Repository) Preferences(userID int64) (domain.Preferences, []string, error) {
	var rawPrefs, rawInterests string
	err := r.db.QueryRow("SELECT preferences, interests FROM user_profiles WHERE user_id=?", userID).Scan(&rawPrefs, &rawInterests)
	if err == sql.ErrNoRows {
		prefs := domain.Preferences{Notifications: true, Privacy: "standard", Language: "id", Currency: "IDR"}
		b, _ := json.Marshal(prefs)
		_, err = r.db.Exec("INSERT INTO user_profiles(user_id,preferences,interests) VALUES(?,?,?)", userID, string(b), "[]")
		return prefs, []string{}, err
	}
	if err != nil {
		return domain.Preferences{}, nil, err
	}
	var prefs domain.Preferences
	var interests []string
	_ = json.Unmarshal([]byte(rawPrefs), &prefs)
	_ = json.Unmarshal([]byte(rawInterests), &interests)
	return prefs, interests, nil
}

func (r Repository) UpdatePreferences(userID int64, prefs domain.Preferences) error {
	b, _ := json.Marshal(prefs)
	_, err := r.db.Exec("UPDATE user_profiles SET preferences=? WHERE user_id=?", string(b), userID)
	return err
}

func (r Repository) UpdateInterests(userID int64, interests []string) error {
	b, _ := json.Marshal(interests)
	_, err := r.db.Exec("UPDATE user_profiles SET interests=? WHERE user_id=?", string(b), userID)
	return err
}
