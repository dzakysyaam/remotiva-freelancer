package security

import (
	"crypto/sha256"
	"encoding/hex"
)

func PasswordHash(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}

func MatchPassword(hash, password string) bool {
	return hash == PasswordHash(password)
}
