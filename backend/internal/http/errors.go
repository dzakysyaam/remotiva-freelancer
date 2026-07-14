package httpapi

import (
	"errors"
	"net/http"
)

type apiError struct {
	Code    int
	Message string
}

func (e apiError) Error() string { return e.Message }

func client(message string) error   { return apiError{Code: http.StatusBadRequest, Message: message} }
func notFound(message string) error { return apiError{Code: http.StatusNotFound, Message: message} }
func unauthorized() error {
	return apiError{Code: http.StatusUnauthorized, Message: "sesi tidak valid"}
}
func method() error {
	return apiError{Code: http.StatusMethodNotAllowed, Message: "method tidak didukung"}
}

func (s Server) handleError(w http.ResponseWriter, err error) {
	var e apiError
	if errors.As(err, &e) {
		_ = write(w, e.Code, map[string]string{"message": e.Message})
		return
	}
	_ = write(w, http.StatusInternalServerError, map[string]string{"message": "terjadi kesalahan pada server"})
}
