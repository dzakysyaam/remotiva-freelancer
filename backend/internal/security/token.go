package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Claims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Exp    int64  `json:"exp"`
}

func Sign(claims Claims, secret string) (string, error) {
	claims.Exp = time.Now().Add(24 * time.Hour).Unix()
	body, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	payload := base64.RawURLEncoding.EncodeToString(body)
	sig := signature(payload, secret)
	return payload + "." + sig, nil
}

func Verify(token, secret string) (Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 || !hmac.Equal([]byte(signature(parts[0], secret)), []byte(parts[1])) {
		return Claims{}, errors.New("invalid token")
	}
	decoded, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return Claims{}, err
	}
	var claims Claims
	if err := json.Unmarshal(decoded, &claims); err != nil {
		return Claims{}, err
	}
	if time.Now().Unix() > claims.Exp {
		return Claims{}, errors.New("expired token")
	}
	return claims, nil
}

func signature(payload, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func Bearer(header string) (string, error) {
	if !strings.HasPrefix(header, "Bearer ") {
		return "", fmt.Errorf("missing bearer token")
	}
	return strings.TrimPrefix(header, "Bearer "), nil
}
