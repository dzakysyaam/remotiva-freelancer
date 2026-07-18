# Security Notes - Remotiva

## Overview

This document outlines the security measures implemented in Remotiva and explains their limitations.

**IMPORTANT: No frontend security measure can fully prevent inspection or scraping. Real protection comes from backend controls.**

---

## Frontend Inspect Deterrent

### What it does:
- Disables right-click context menu in production builds
- Blocks common DevTools keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
- Only active in production (`import.meta.env.PROD === true`)

### What it does NOT do:
- Cannot prevent users from using browser menu → Developer Tools
- Cannot prevent users from using `javascript:` URLs
- Cannot hide API calls visible in Network tab
- Cannot protect data sent to/from backend

### Why it exists:
- Makes casual copying harder for non-technical users
- Provides minimal friction against quick scraping attempts
- Does not affect developer workflow (disabled in dev mode)

---

## Source Maps

### What it does:
- Production builds have `sourcemap: false`
- Console statements removed in production minification

### What it does NOT do:
- Cannot hide business logic from determined users
- Code is still executable in browser

---

## API Rate Limiting

### Implemented limits:
| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/register | 10 req/IP | 1 minute |
| POST /api/auth/login | 10 req/IP | 1 minute |
| GET /api/services | 60 req/IP | 1 minute |
| GET /api/services/{id} | 120 req/IP | 1 minute |
| GET /api/categories | 60 req/IP | 1 minute |

### Response on limit exceeded:
```json
{
  "detail": "Terlalu banyak permintaan. Silakan coba lagi nanti."
}
```

### Headers returned:
- `Retry-After`: Seconds until limit resets
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Secrets Management

### Frontend (Safe):
- `VITE_API_URL` - API endpoint URL

### Frontend (NEVER):
- JWT_SECRET
- Database credentials
- Payment gateway keys
- Admin passwords

### Backend (.env):
- `JWT_SECRET` - Server-side only
- `MYSQL_DSN` - Database connection
- `APP_PORT` - Server port

---

## What Protects the App

### Real protection:
1. **Backend authorization** - JWT tokens validated server-side
2. **Rate limiting** - Prevents automated scraping
3. **Input validation** - SQL injection, XSS prevention
4. **HTTPS** - Encryption in transit
5. **Environment isolation** - Secrets never exposed to frontend

### Not protection:
1. Frontend code inspection prevention
2. Obfuscation
3. Anti-bot JavaScript tricks

---

## For Production Deployment

For a publicly deployed application, consider:

1. **Cloudflare WAF** - Web Application Firewall
2. **Redis rate limiting** - Distributed rate limiting
3. **CDN caching** - Reduces load and hides origin
4. **Bot management** - Cloudflare Bot Management
5. **DDoS protection** - Cloudflare DDoS protection
6. **HSTS** - Force HTTPS
7. **CSP headers** - Content Security Policy

---

## Honesty Statement

We implement practical deterrents, not security theater:

- DevTools CANNOT be fully disabled
- Inspect Element CANNOT be blocked
- Determined scrapers WILL find a way
- Real security is server-side

Our goal: Make casual copying inconvenient while maintaining good UX and developer experience.
