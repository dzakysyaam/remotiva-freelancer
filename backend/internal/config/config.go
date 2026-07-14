package config

import "os"

type Config struct {
	Port      string
	MySQLDSN  string
	JWTSecret string
}

func Load() Config {
	return Config{
		Port:      value("APP_PORT", "3504"),
		MySQLDSN:  value("MYSQL_DSN", "root:@tcp(127.0.0.1:3306)/remotiva_db?parseTime=true&multiStatements=true"),
		JWTSecret: value("JWT_SECRET", "remotiva-local-secret-change-me"),
	}
}

func value(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}