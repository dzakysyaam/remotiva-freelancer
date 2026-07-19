# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-07-19

### Added

#### Enhanced Security
- **Enhanced SecurityGuard component**
  - Layer 1: Blocks DevTools keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  - Layer 2: Blocks right-click context menu (allows in inputs)
  - Layer 3: Detects when DevTools is opened via window size monitoring
  - Layer 4: Console deterrent with Function.prototype.toString override
  - Layer 5: Image drag prevention and text selection blocking
  - Layer 6: Escalating response after 3+ detection attempts (shows blocked page)
  - Only active in production build

- **Backend Security Middleware** (`backend/app/security_middleware.py`)
  - Security headers on all responses (CSP, HSTS, X-Frame-Options, etc.)
  - Comprehensive rate limiting with per-endpoint limits
  - SQL injection and XSS pattern detection
  - Bot detection with User-Agent validation
  - Security event logging and statistics
  - IP blocking capability
  - Request audit logging

- **Security Headers Middleware**
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - X-Frame-Options: DENY
  - Content-Security-Policy
  - Strict-Transport-Security
  - Referrer-Policy
  - Permissions-Policy
  - Cache-Control for sensitive pages

- **Request Validation Middleware**
  - Missing User-Agent detection
  - Suspicious URL pattern detection
  - Request timing and audit logging
  - Rate limit headers on responses

- **Security Monitoring Endpoints**
  - GET /api/admin/security/stats - Security events overview
  - GET /api/admin/security/bot-stats - Bot detection stats
  - GET /api/admin/security/rate-limit-stats - Rate limiting stats

- **Security Documentation** (`docs/SECURITY.md`)
  - Comprehensive security architecture documentation
  - Layer-by-layer security explanation
  - Testing procedures
  - Deployment checklist
  - Limitations and reality check

### Security Notes

**Frontend Security Reality:**
- Frontend protections are DETERRENT ONLY
- DevTools cannot be fully blocked (browser limitation)
- JavaScript in browser is always inspectable
- Real security is BACKEND authorization + validation
- Never expose sensitive data to frontend

**What Frontend Security CAN Do:**
- ✅ Deter casual inspection
- ✅ Make scraping harder
- ✅ Block accidental DevTools opening
- ✅ Create psychological barrier
- ✅ Log suspicious activity

**Real Security Depends On:**
- ✅ Backend validates ALL user input
- ✅ API endpoints check permissions
- ✅ Rate limiting is enforced
- ✅ SQL injection is prevented
- ✅ Sensitive data is not exposed in API

## [2.1.1] - 2026-07-19

### Added

#### Frontend Security
- **SecurityGuard component** - Frontend inspect deterrent
  - Blocks right-click context menu in production
  - Blocks common DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, etc.)
  - Blocks image drag-to-save
  - Only active in production (import.meta.env.PROD === true)
  - Does not break normal form input/typing

- **Source map disabled** in production builds
  - No .map files generated
  - Terser minification with console/debugger removal

#### Backend Security
- **Rate limiting** on public API endpoints
  - Public listing endpoints: 60 requests/minute/IP
  - Login/Register: 10 requests/minute/IP
  - Service detail: 120 requests/minute/IP
  - Returns 429 with proper headers when exceeded

- **Bot detection middleware** (basic logging)
  - Logs requests with missing User-Agent
  - Tracks high-frequency requests
  - Honeypot route detection
  - Security stats endpoint: /api/admin/security/stats

- **robots.txt** added
  - Disallows /api/, /app/admin, /app/seller, /app/checkout, /auth/
  - Allows public browse/search pages

#### Admin Features
- **CRUD User Management**
  - Create user via admin panel
  - Delete user via admin panel
  - Updated role management
  - User deletion confirmation modal

- **Customer Service Admin Improvements**
  - Role badge displayed on CS thread list
  - Better visibility of buyer vs seller threads
  - user_role field added to thread responses

### Security Notes
- Created docs/SECURITY_NOTES.md documenting:
  - Frontend deterrent limitations
  - Backend protection measures
  - Production deployment recommendations
  - What stakeholders can/cannot expect

### Dependencies
- Added terser for minification
- Added esbuild dependency
- Added pytest-asyncio for testing
- Added httpx for async test client

## [2.0.0] - 2026-07-19

### Added
- FastAPI backend with Clean Architecture
- React + Vite frontend
- User authentication with JWT
- Marketplace features (services, categories, orders)
- Customer service functionality
- Admin dashboard with user management
- Buyer and seller dashboards

### Backend Endpoints
- Authentication: /api/auth/register, /api/auth/login
- Services: /api/services, /api/services/{id}
- Categories: /api/categories
- Orders: /api/orders, /api/orders/{id}
- Saved Services: /api/saved
- Messages: /api/messages
- Profile: /api/profile
- Payments: /api/payments
- Admin: /api/admin/users, /api/admin/customer-service/*

### Frontend Pages
- Home with hero video
- Search/marketplace
- Category pages
- Service detail
- Checkout flow
- Orders page
- Saved services
- Profile management
- Buyer/seller/admin dashboards

## [1.0.0] - 2026-01-01

### Added
- Initial project setup
- Basic structure
