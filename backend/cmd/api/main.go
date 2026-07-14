package main

import (
	"fmt"
	"log"
	"net/http"

	"remotiva/backend/internal/config"
	"remotiva/backend/internal/db"
	api "remotiva/backend/internal/http"
	"remotiva/backend/internal/repository"
)

func main() {
	cfg := config.Load()

	conn, err := db.Open(cfg.MySQLDSN)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	repo := repository.New(conn)
	server := api.New(repo, cfg.JWTSecret)

	addr := fmt.Sprintf(":%s", cfg.Port)
	url := fmt.Sprintf("http://localhost:%s", cfg.Port)

	log.Printf("Remotiva API running on %s", url)

	if err := http.ListenAndServe(addr, server.Handler()); err != nil {
		log.Fatal(err)
	}
}