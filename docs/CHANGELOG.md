# Changelog

## [2.1.0] - 2026-07-18

### Changed - UI Copy Localization

#### Frontend Changes
- **Indonesian Localization**: Standardized all user-facing text to professional Indonesian
  - Login/Register pages updated with Indonesian labels
  - Buyer/Seller/Admin dashboards updated with Indonesian labels
  - Checkout/Payment page updated with Indonesian labels
  - Customer Service popup updated with Indonesian labels
  - Service Detail page updated with Indonesian labels
  - Navigation and footer updated with Indonesian labels

- **Centralized UI Copy**: Added `frontend/src/data/uiCopy.js`
  - Centralized all UI text for easy maintenance
  - Added formatter functions for status/role display
  - Professional Tokopedia-style Indonesian language

- **Icon Consistency**: Synced Customer Service icon across all pages
  - Dashboard action cards now use headset icon
  - Customer Service popup uses headset icon
  - Floating CS button uses headset icon
  - Admin CS tab uses headset icon

#### Status Label Translations
| Backend Value | Indonesian Display |
|-------------|-------------------|
| pending | Menunggu |
| in_progress | Diproses |
| completed | Selesai |
| cancelled | Dibatalkan |
| paid | Sudah Dibayar |
| failed | Gagal |
| expired | Kedaluwarsa |

#### Role Label Translations
| Backend Value | Indonesian Display |
|-------------|-------------------|
| buyer | Pembeli |
| seller | Penjual |
| admin | Admin |

---

## [2.0.0] - 2026-07-18

### Added - Role-Based Dashboard System

#### Database Changes
- Added `is_active` column to users table
- Added `updated_at` column to users table
- Added admin seed user: `admin@remotiva.id`
- Added `customer_service_threads` table
- Added `customer_service_messages` table
- Added `payments` table

#### Backend Changes

**Auth System**
- `POST /api/auth/register` - Now rejects admin role from public registration
- `POST /api/auth/login` - Returns `is_active` field, blocks inactive users
- `GET /api/me` - Returns `is_active` field

**New Admin APIs**
- `GET /api/admin/users` - List all users (admin only)
- `PATCH /api/admin/users/{id}/toggle-active` - Toggle user active/inactive
- `PATCH /api/admin/users/{id}/role` - Update user role

**New Customer Service APIs**
- `GET /api/customer-service/threads` - User's CS threads
- `POST /api/customer-service/threads` - Create new thread
- `GET /api/customer-service/threads/{id}/messages` - Get thread messages
- `POST /api/customer-service/threads/{id}/messages` - Send message
- `GET /api/admin/customer-service/threads` - Admin: all threads
- `POST /api/admin/customer-service/threads/{id}/messages` - Admin: reply
- `PATCH /api/admin/customer-service/threads/{id}/status` - Admin: update status

**New Payment Simulation APIs**
- `GET /api/payments` - User's payment history
- `POST /api/payments/create` - Create payment for order
- `GET /api/payments/{id}` - Get payment details
- `PATCH /api/payments/{id}/mark-paid` - Simulate payment success
- `PATCH /api/payments/{id}/mark-failed` - Simulate payment failure

#### Frontend Changes

**New Routes**
- `/app/buyer` - Buyer Dashboard
- `/app/seller` - Seller Dashboard
- `/app/admin` - Admin Dashboard

**New Components**
- `CustomerServiceButton` - Floating CS button
- `CustomerServicePopup` - CS chat popup
- `BuyerDashboard` - Buyer role dashboard
- `SellerDashboard` - Seller role dashboard
- `AdminDashboard` - Admin role dashboard with user management

**Role-Based Access Control**
- Buyers can only access `/app/buyer`
- Sellers can only access `/app/seller`
- Admins can only access `/app/admin`
- Role guards redirect unauthorized access

**Login/Register Updates**
- Login redirects to role-specific dashboard
- Register creates buyer or seller only (no admin)
- Admin accounts only from database seed

#### Payment Simulation (Midtrans-style)
- Virtual Account (BCA, Mandiri, BNI)
- Bank Transfer
- E-Wallet (GoPay, OVO)
- QRIS mock
- Payment gateway modal UI
- Simulated success/failure
- No real card data collected

#### Customer Service Features
- Floating CS button on all dashboards
- Chat popup with thread management
- Admin CS inbox with reply capability
- Thread status management (open/pending/closed)

---

## [1.10.0] - 2026-07-18

### Changed
- **Footer Social Links**: Updated to user's personal accounts
  - Twitter/X: `https://x.com/elonmusk`
  - LinkedIn: `https://www.linkedin.com/in/muhammaddzakysyamhaidar`
  - Instagram: `https://www.instagram.com/dzakysyaam`

## [1.9.0] - 2026-07-18

### Changed
- **Gig Thumbnails**: Now use local Remotiva card assets
  - Removed external Unsplash URLs
  - Uses `/assets/card-remotiva-1.png` through `/assets/card-remotiva-7.png`
  - Deterministic mapping by title keywords

### Fixed
- **Asset Filenames**: Renamed to cleaner format
  - `card_remotiva (1).png` → `card-remotiva-1.png`

## [1.8.0] - 2026-07-17

### Changed
- **Auth Mascot**: Complete redesign for professional look
  - New large SVG illustration (320px)
  - Friendly freelancer with floating project cards
  - Remotiva blue accent in outfit
  - SaaS-style flat design with shadows
  - Multiple floating animations

## [1.0.0] - 2026-07-14

### Added
- Initial project structure
- Python FastAPI backend
- React frontend with Vite
- Brand Logo component
- Authentication pages (Login/Register)
- Marketplace features (services, categories, orders)
- User profile and settings
