package domain

import "time"

type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type Category struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Icon        string `json:"icon"`
	Description string `json:"description"`
}

type Service struct {
	ID           int64   `json:"id"`
	CategoryID   int64   `json:"category_id"`
	CategorySlug string  `json:"category_slug"`
	SellerID     int64   `json:"seller_id"`
	SellerName   string  `json:"seller_name"`
	SellerLevel  string  `json:"seller_level"`
	Title        string  `json:"title"`
	Description  string  `json:"description"`
	ImageURL     string  `json:"image_url"`
	Price        float64 `json:"price"`
	Rating       float64 `json:"rating"`
	DeliveryDays int     `json:"delivery_days"`
	IsFeatured   bool    `json:"is_featured"`
}

type Order struct {
	ID           int64     `json:"id"`
	ServiceID    int64     `json:"service_id"`
	ServiceTitle string    `json:"service_title"`
	PackageName  string    `json:"package_name"`
	Status       string    `json:"status"`
	TotalPrice   float64   `json:"total_price"`
	CreatedAt    time.Time `json:"created_at"`
}

type Message struct {
	ID          int64  `json:"id"`
	Initial     string `json:"initial"`
	SenderName  string `json:"sender_name"`
	LastMessage string `json:"last_message"`
	SentAt      string `json:"sent_at"`
}

type Preferences struct {
	Notifications bool   `json:"notifications"`
	Privacy       string `json:"privacy"`
	Language      string `json:"language"`
	Currency      string `json:"currency"`
}
