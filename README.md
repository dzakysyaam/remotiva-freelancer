# Remotiva - Professional Freelance Marketplace
Remotiva is a professional freelance marketplace web platform that connects clients with skilled freelancers for digital services. The platform features a modern, responsive design inspired by leading freelance marketplaces like Fiverr and Upwork.

## Tech Stack
- **Frontend**: React + Vite, React Router, Lucide React Icons
- **Backend**: Python, Clean layered architecture
- **Database**: MySQL
- **Database Name**: `remotiva_db`

## Project Structure

```
remotiva/
├── backend/
│   ├── cmd/api/          # Entry point
│   └── internal/
│       ├── config/       # Environment configuration
│       ├── db/           # Database connection
│       ├── domain/       # Data models
│       ├── http/         # API handlers & routing
│       ├── repository/   # Data access layer
│       └── security/     # JWT & password handling
├── frontend/
│   ├── public/assets/    # Static assets
│   └── src/
│       ├── components/   # Reusable components
│       │   ├── layout/  # Shell, Navbar, Footer
│       │   ├── marketplace/ # Service cards, filters
│       │   └── ui/      # Buttons, inputs, badges
│       ├── lib/          # API client
│       └── pages/        # Page components
├── database/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
└── docs/
    └── PRD.md            # Product requirements
```

## Features

### User Features
- **Authentication**: Register and login with JWT tokens
- **Browse Services**: Explore services by category with filtering
- **Service Details**: View detailed service information with pricing
- **Order Management**: Place and track orders
- **Saved Services**: Save favorite services for later
- **Profile Management**: Update profile, interests, and preferences
- **Become a Seller**: Information page for freelancers

### Pages
- **Landing/Home**: Hero section, categories, featured services, trust section
- **Search/Marketplace**: Category browsing, search, filtering, service grid
- **Service Detail**: Full service information with order capability
- **Orders Dashboard**: Order listing with status tracking
- **Inbox**: Message conversations
- **Profile**: User profile with saved services and settings

## Running the Application

### Prerequisites
- Node.js 18+
- Go 1.21+
- MySQL 8.0+ (or Docker)

### 1. Setup Database

Using XAMPP MySQL (port 3306):

```sql
CREATE DATABASE remotiva_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then execute the schema and seed files:

```bash
mysql -u root -p remotiva_db < database/schema.sql
mysql -u root -p remotiva_db < database/seed.sql
```

Or using Docker:

```bash
docker compose up -d mysql
```

### 2. Run Backend

```bash
cd backend

# Set environment variables (Windows PowerShell)
$env:APP_PORT="3504"
$env:MYSQL_DSN="root:@tcp(127.0.0.1:3306)/remotiva_db?parseTime=true&multiStatements=true"
$env:JWT_SECRET="9663fdd00d06f2745b37b75497a5aee59a2a806c5db333ede851b4a1a2ca057ae46e3f3b1190a4e4a836de0bd6b10f42403b7547b724c857f692f819932af2ca"

# Run the server
go run ./cmd/api
```

Or use the existing .env file:

```bash
cd backend
go run ./cmd/api
```

API will be available at: `http://localhost:3504/api`

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Test Account

```
Email: fery@remotiva.id
Password: password
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/me | Get current user |
| GET | /api/categories | List categories |
| GET | /api/services | List services |
| GET | /api/services/{id} | Get service details |
| GET | /api/saved | List saved services |
| POST | /api/saved/{id} | Save a service |
| DELETE | /api/saved/{id} | Remove saved service |
| GET | /api/orders | List user orders |
| POST | /api/orders | Create new order |
| GET | /api/messages | List messages |
| GET | /api/profile | Get user profile |
| PATCH | /api/profile/preferences | Update preferences |
| PATCH | /api/profile/interests | Update interests |

## Design System

### Colors
- Primary: `#2563eb` (Blue)
- Primary Dark: `#1d4ed8`
- Primary Light: `#dbeafe`
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`
- Background: `#f8fafc`
- Surface: `#ffffff`
- Text: `#0f172a`
- Text Secondary: `#64748b`
- Border: `#e2e8f0`

### Typography
- Font Family: Inter (Google Fonts)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Spacing
- Border Radius: 6px, 10px, 14px, 20px
- Shadows: sm, default, lg

### Breakpoints
- Desktop: >= 1200px
- Tablet: 768px - 1024px
- Mobile: < 768px

## Database Schema

### Tables
- `users` - User accounts
- `categories` - Service categories
- `services` - Freelance services
- `saved_services` - User's saved services
- `orders` - Order records
- `messages` - Message conversations
- `user_profiles` - User preferences and interests

## Development Notes

- Frontend uses React Router for navigation
- JWT tokens stored in localStorage
- API base URL configured via `VITE_API_URL` environment variable
- All protected routes require authentication
- Backend uses clean layered architecture (domain → repository → http)
