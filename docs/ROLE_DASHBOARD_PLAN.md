# Role-Based Dashboard Plan

## Scope

Implementasi role-based dashboard system untuk Remotiva marketplace dengan:
1. Role-based routing (buyer/seller/admin)
2. Dashboard terpisah untuk setiap role
3. Admin user management dengan toggle active/inactive
4. RBAC (Role-Based Access Control) middleware

## Affected Files

### Database
- `database/schema.sql` - Tambah kolom `is_active` ke users, tambah admin seed

### Backend
- `backend/app/models/__init__.py` - Update User model
- `backend/app/schemas/__init__.py` - Update schemas
- `backend/app/routers/auth.py` - Update register/login response
- `backend/app/routers/admin.py` - **NEW** Admin routes
- `backend/app/routers/__init__.py` - Export admin router
- `backend/app/security/__init__.py` - Role checking utilities
- `backend/app/dependencies.py` - Role-based dependency injection

### Frontend
- `frontend/src/main.jsx` - Update routes
- `frontend/src/pages/buyer/` - **NEW** Buyer dashboard
- `frontend/src/pages/seller/` - **NEW** Seller dashboard
- `frontend/src/pages/admin/` - **NEW** Admin dashboard
- `frontend/src/pages/Login.jsx` - Update redirect logic
- `frontend/src/pages/Register.jsx` - Update role options
- `frontend/src/lib/api.js` - Update API client

## API Changes

### Existing Modified
- `POST /api/auth/register` - Reject admin role
- `POST /api/auth/login` - Return `is_active` field
- `GET /api/me` - Return `is_active` field

### New Endpoints
```
GET    /api/admin/users           - List all users (admin only)
PATCH  /api/admin/users/{id}/toggle-active - Toggle user active status
PATCH  /api/admin/users/{id}/role  - Change user role
```

## Database Changes

```sql
-- Tambah kolom is_active ke users
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Tambah admin seed
INSERT INTO users (name, email, password_hash, role, is_active, seller_level)
VALUES ('Admin Remotiva', 'admin@remotiva.id', '$2b$12$...', 'admin', TRUE, 'Admin');
```

## Frontend Route Changes

```
/app/buyer          -> BuyerDashboard (buyer only)
/app/seller         -> SellerDashboard (seller only)
/app/admin          -> AdminDashboard (admin only)
/app/orders         -> (buyer/seller only)
/app/...            -> (existing pages)
```

## Acceptance Criteria

1. [ ] Buyer tidak bisa register dengan role admin
2. [ ] Login redirect berdasarkan role (buyer->/app/buyer, seller->/app/seller, admin->/app/admin)
3. [ ] Buyer tidak bisa akses /app/seller atau /app/admin
4. [ ] Seller tidak bisa akses /app/buyer atau /app/admin
5. [ ] Admin bisa akses /app/admin
6. [ ] Admin bisa list semua users
7. [ ] Admin bisa toggle active/inactive user
8. [ ] User inactive tidak bisa login (error message)

## What Is NOT Included

- WebSocket real-time untuk dashboard
- Advanced analytics untuk admin
- Bulk user operations
- User avatar upload
- Email verification
