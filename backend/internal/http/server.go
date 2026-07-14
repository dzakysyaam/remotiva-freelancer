package httpapi

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"remotiva/backend/internal/domain"
	"remotiva/backend/internal/repository"
	"remotiva/backend/internal/security"
)

type Server struct {
	repo   repository.Repository
	secret string
}

func New(repo repository.Repository, secret string) Server {
	return Server{repo: repo, secret: secret}
}

func (s Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", s.wrap(s.health))
	mux.HandleFunc("/api/auth/register", s.wrap(s.register))
	mux.HandleFunc("/api/auth/login", s.wrap(s.login))
	mux.HandleFunc("/api/me", s.auth(s.me))
	mux.HandleFunc("/api/categories", s.auth(s.categories))
	mux.HandleFunc("/api/services", s.auth(s.services))
	mux.HandleFunc("/api/services/", s.auth(s.service))
	mux.HandleFunc("/api/saved", s.auth(s.saved))
	mux.HandleFunc("/api/saved/", s.auth(s.savedAction))
	mux.HandleFunc("/api/orders", s.auth(s.orders))
	mux.HandleFunc("/api/messages", s.auth(s.messages))
	mux.HandleFunc("/api/profile", s.auth(s.profile))
	mux.HandleFunc("/api/profile/preferences", s.auth(s.updatePreferences))
	mux.HandleFunc("/api/profile/interests", s.auth(s.updateInterests))
	return s.cors(mux)
}

func (s Server) health(w http.ResponseWriter, r *http.Request) error {
	return write(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s Server) register(w http.ResponseWriter, r *http.Request) error {
	if r.Method != http.MethodPost {
		return method()
	}
	var req struct{ Name, Email, Password, Role string }
	if err := read(r, &req); err != nil {
		return err
	}
	if req.Name == "" || req.Email == "" || len(req.Password) < 6 {
		return client("nama, email, dan password minimal 6 karakter wajib diisi")
	}
	if req.Role == "" {
		req.Role = "buyer"
	}
	hash := security.PasswordHash(req.Password)
	user, err := s.repo.CreateUser(req.Name, strings.ToLower(req.Email), hash, req.Role)
	if err != nil {
		return err
	}
	return s.session(w, user)
}

func (s Server) login(w http.ResponseWriter, r *http.Request) error {
	if r.Method != http.MethodPost {
		return method()
	}
	var req struct{ Email, Password string }
	if err := read(r, &req); err != nil {
		return err
	}
	user, hash, err := s.repo.UserByEmail(strings.ToLower(req.Email))
	if err != nil || !security.MatchPassword(hash, req.Password) {
		return client("email atau password tidak sesuai")
	}
	return s.session(w, user)
}

func (s Server) session(w http.ResponseWriter, user domain.User) error {
	token, err := security.Sign(security.Claims{UserID: user.ID, Email: user.Email, Role: user.Role}, s.secret)
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, map[string]any{"token": token, "user": user})
}

func (s Server) me(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	user, err := s.repo.UserByID(c.UserID)
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, user)
}

func (s Server) categories(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	items, err := s.repo.Categories()
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, items)
}

func (s Server) services(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	items, err := s.repo.Services(r.URL.Query().Get("category"), r.URL.Query().Get("q"), limit)
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, items)
}

func (s Server) service(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	id, err := parseID(r.URL.Path, "/api/services/")
	if err != nil {
		return client("id layanan tidak valid")
	}
	item, err := s.repo.Service(id)
	if errors.Is(err, sql.ErrNoRows) {
		return notFound("layanan tidak ditemukan")
	}
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, item)
}

func (s Server) saved(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	if r.Method != http.MethodGet {
		return method()
	}
	items, err := s.repo.Saved(c.UserID)
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, items)
}

func (s Server) savedAction(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	id, err := parseID(r.URL.Path, "/api/saved/")
	if err != nil {
		return client("id layanan tidak valid")
	}
	if r.Method == http.MethodPost {
		return write(w, http.StatusOK, map[string]bool{"saved": s.repo.SaveService(c.UserID, id) == nil})
	}
	if r.Method == http.MethodDelete {
		return write(w, http.StatusOK, map[string]bool{"removed": s.repo.RemoveSaved(c.UserID, id) == nil})
	}
	return method()
}

func (s Server) orders(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	if r.Method == http.MethodGet {
		items, err := s.repo.Orders(c.UserID)
		if err != nil {
			return err
		}
		return write(w, http.StatusOK, items)
	}
	if r.Method == http.MethodPost {
		var req struct {
			ServiceID   int64  `json:"service_id"`
			PackageName string `json:"package_name"`
		}
		if err := read(r, &req); err != nil {
			return err
		}
		if req.PackageName == "" {
			req.PackageName = "Standard"
		}
		if err := s.repo.CreateOrder(c.UserID, req.ServiceID, req.PackageName); err != nil {
			return err
		}
		return write(w, http.StatusCreated, map[string]string{"status": "created"})
	}
	return method()
}

func (s Server) messages(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	items, err := s.repo.Messages(c.UserID)
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, items)
}

func (s Server) profile(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	prefs, interests, err := s.repo.Preferences(c.UserID)
	if err != nil {
		return err
	}
	return write(w, http.StatusOK, map[string]any{"preferences": prefs, "interests": interests})
}

func (s Server) updatePreferences(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	if r.Method != http.MethodPatch {
		return method()
	}
	var prefs domain.Preferences
	if err := read(r, &prefs); err != nil {
		return err
	}
	if err := s.repo.UpdatePreferences(c.UserID, prefs); err != nil {
		return err
	}
	return write(w, http.StatusOK, map[string]bool{"updated": true})
}

func (s Server) updateInterests(w http.ResponseWriter, r *http.Request, c security.Claims) error {
	if r.Method != http.MethodPatch {
		return method()
	}
	var req struct {
		Interests []string `json:"interests"`
	}
	if err := read(r, &req); err != nil {
		return err
	}
	if err := s.repo.UpdateInterests(c.UserID, req.Interests); err != nil {
		return err
	}
	return write(w, http.StatusOK, map[string]bool{"updated": true})
}

func (s Server) auth(next func(http.ResponseWriter, *http.Request, security.Claims) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		s.wrap(func(w http.ResponseWriter, r *http.Request) error {
			token, err := security.Bearer(r.Header.Get("Authorization"))
			if err != nil {
				return unauthorized()
			}
			claims, err := security.Verify(token, s.secret)
			if err != nil {
				return unauthorized()
			}
			return next(w, r, claims)
		})(w, r)
	}
}

func (s Server) wrap(next func(http.ResponseWriter, *http.Request) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := next(w, r); err != nil {
			s.handleError(w, err)
		}
	}
}

func (s Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func parseID(path, prefix string) (int64, error) {
	return strconv.ParseInt(strings.TrimPrefix(path, prefix), 10, 64)
}
func read(r *http.Request, v any) error { return json.NewDecoder(r.Body).Decode(v) }
func write(w http.ResponseWriter, code int, v any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	return json.NewEncoder(w).Encode(v)
}
