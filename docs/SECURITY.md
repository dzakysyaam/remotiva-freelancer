# Security Documentation

## Overview

Remotiva implements a **defense-in-depth** security strategy with multiple layers of protection:

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   LAYER 1   │    │   LAYER 2   │    │   LAYER 3   │        │
│  │  Frontend   │ →  │   Backend   │ →  │   API Auth  │        │
│  │ Deterrents  │    │  Middleware │    │    Guards   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   LAYER 4   │    │   LAYER 5   │    │   LAYER 6   │        │
│  │   Rate      │    │   SQL/Input  │    │   Session   │        │
│  │  Limiting   │    │   Validation│    │  Management │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Layer 1: Frontend Deterrents

### SecurityGuard Component

**Location:** `frontend/src/components/security/SecurityGuard.jsx`

**Features:**
- Blocks DevTools keyboard shortcuts (F12, Ctrl+Shift+I/J/C)
- Blocks right-click context menu (except in inputs)
- Detects when DevTools is opened via window size difference
- Shows blocked page after 3+ attempts
- Prevents image drag/save
- Prevents text selection outside inputs
- Console deterrent messages

**Activation:** Only in production (`import.meta.env.PROD === true`)

**Usage:**
```jsx
import SecurityGuard from './components/security/SecurityGuard'

function App() {
  return (
    <>
      <SecurityGuard />
      {/* rest of app */}
    </>
  )
}
```

**Blocked Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| F12 | Developer Tools |
| Ctrl+Shift+I | DevTools (Windows) |
| Cmd+Option+I | DevTools (Mac) |
| Ctrl+Shift+J | Console |
| Ctrl+Shift+C | Element Inspector |
| Ctrl+U | View Source |

### CSS Text Selection Protection

Prevents users from selecting and copying text outside of input fields.

## Layer 2: Backend Security Middleware

**Location:** `backend/app/security_middleware.py`

### Security Headers

All responses include these security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS filter (legacy) |
| X-Frame-Options | DENY | Prevent clickjacking |
| Content-Security-Policy | strict | CSP policy |
| Strict-Transport-Security | max-age=31536000 | Force HTTPS |
| Referrer-Policy | strict-origin | Control referrer |
| Permissions-Policy | restrictive | Limit browser features |
| Server | Remotiva | Hide server identity |

### Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 10 req | 1 minute |
| Public API | 60 req | 1 minute |
| Authenticated API | 200 req | 1 minute |
| Admin API | 100 req | 1 minute |

### Bot Detection

- Detects missing User-Agent headers
- Detects suspicious request patterns
- Tracks suspicious IPs
- Logs security events

### Request Validation

- SQL injection pattern detection
- XSS pattern detection
- Suspicious URL detection
- Input sanitization

## Layer 3: API Authentication

### JWT Tokens

- Tokens expire after 24 hours
- Tokens include user_id, email, role
- Tokens are signed with HMAC-SHA256

### Role-Based Access Control

```python
# Only admin can access
@router.get("/admin/users")
async def get_users(current_user: User = Depends(require_admin)):
    ...

# Only authenticated users
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    ...
```

### Endpoint Permissions

| Endpoint | Required Role |
|----------|--------------|
| /api/admin/* | admin |
| /api/customer-service/threads | authenticated |
| /api/customer-service/admin/* | admin |
| /api/services | public |
| /api/categories | public |

## Layer 4: Database Security

### SQL Injection Prevention

- All queries use SQLAlchemy ORM
- Parameterized queries
- Input validation before DB operations

### Password Hashing

- Uses bcrypt with salt
- Minimum 6 characters required

## Layer 5: Input Validation

### Email Validation

```python
def validate_email_format(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
```

### Password Validation

```python
def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    if len(password) < 6:
        return False, "Password must be at least 6 characters"
    return True, None
```

### SQL Injection Detection

```python
SUSPICIOUS_PATTERNS = [
    r'union\s+select',
    r'drop\s+table',
    r'<script',
    r'javascript:',
    r'onerror=',
    # ... more patterns
]
```

## Layer 6: Session Management

### Client-Side

- Tokens stored in localStorage
- Session validation on each request
- Auto-redirect to login on invalid session

### Server-Side

- Token validation on each protected endpoint
- User existence check
- Active user check

## Security Monitoring

### Admin Security Dashboard

Access at: `/api/admin/security/stats`

```json
{
  "total_events": 42,
  "events_by_type": {
    "MISSING_USER_AGENT": 15,
    "SUSPICIOUS_URL": 3,
    "IP_BLOCKED": 1
  },
  "blocked_ips": 1
}
```

### Bot Stats

Access at: `/api/admin/security/bot-stats`

### Rate Limit Stats

Access at: `/api/admin/security/rate-limit-stats`

## Testing Security

### Manual Tests

1. **Test DevTools blocking:**
   ```bash
   # Press F12 - should be blocked
   # Right-click - should show blocked message
   # Press Ctrl+Shift+I - should be blocked
   ```

2. **Test rate limiting:**
   ```bash
   # Make 60+ rapid requests to /api/services
   # Should get 429 Too Many Requests
   ```

3. **Test SQL injection:**
   ```bash
   # Try: /api/services?id=1 UNION SELECT * FROM users
   # Should be logged as suspicious
   ```

4. **Test auth rate limiting:**
   ```bash
   # Try 10+ login attempts
   # Should get rate limited
   ```

## Deployment Recommendations

### Production Checklist

- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Use HTTPS with valid SSL certificate
- [ ] Set `APP_PORT` to 443 or behind reverse proxy
- [ ] Configure proper CORS origins
- [ ] Enable bot detection logging
- [ ] Set up monitoring for security events
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Environment Variables

**Backend:**
```env
APP_PORT=3504
MYSQL_DSN=mysql+pymysql://user:pass@localhost:3306/remotiva_db
JWT_SECRET=<your-256-bit-secret>
```

**Frontend:**
```env
VITE_API_URL=https://api.remotiva.id
```

## Limitations

### Frontend Security

⚠️ **IMPORTANT:** Frontend security is **DETERRENT ONLY**

- JavaScript runs in browser and can always be inspected
- DevTools cannot be fully blocked (browser limitation)
- Determined attackers can bypass frontend protections
- **Real security must be on backend**

### What Frontend Security CAN Do

- ✅ Deter casual inspection
- ✅ Make scraping harder
- ✅ Block accidental DevTools opening
- ✅ Create psychological barrier
- ✅ Log suspicious activity

### What Frontend Security CANNOT Do

- ❌ Prevent determined attackers
- ❌ Hide API endpoints
- ❌ Protect sensitive data from API responses
- ❌ Prevent network traffic analysis

## Real Security Checklist

For true security, ensure:

1. ✅ Backend validates ALL user input
2. ✅ API endpoints check permissions
3. ✅ Rate limiting is enforced
4. ✅ SQL injection is prevented
5. ✅ XSS is prevented (CSP)
6. ✅ HTTPS is enforced
7. ✅ Sensitive data is not exposed in API
8. ✅ Sessions expire appropriately
9. ✅ Failed login attempts are limited
10. ✅ Admin actions are logged

## Incident Response

If suspicious activity is detected:

1. Check `/api/admin/security/stats`
2. Check `/api/admin/security/bot-stats`
3. Block suspicious IPs
4. Review logs
5. Implement additional protections if needed

## Contact

For security vulnerabilities, please contact:
security@remotiva.id
