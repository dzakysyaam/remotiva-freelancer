# Remotiva Backend - Python FastAPI

Freelance Marketplace Backend API built with Python FastAPI.

## Requirements

- Python 3.11+
- MySQL 8.0+

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Or create `.env` manually:

```env
APP_PORT=3504
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=remotiva_db
JWT_SECRET=replace_with_generated_secret_here_use_openssl_rand_hex_64
JWT_EXPIRES_HOURS=24
```

Generate a secure JWT secret:

```bash
openssl rand -hex 64
```

### 4. Ensure Database Exists

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS remotiva_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Then run schema and seed:

```bash
mysql -u root -p remotiva_db < ../database/schema.sql
mysql -u root -p remotiva_db < ../database/seed.sql
```

### 5. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 3504
```

Or:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 3504
```

The API will be available at: `http://localhost:3504/api`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:3504/docs`
- ReDoc: `http://localhost:3504/redoc`

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/categories | List categories |
| GET | /api/services | List services |
| GET | /api/services/{id} | Get service details |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/me | Get current user |
| GET | /api/profile | Get user profile |
| PATCH | /api/profile/preferences | Update preferences |
| PATCH | /api/profile/interests | Update interests |
| GET | /api/orders | List user orders |
| POST | /api/orders | Create new order |
| GET | /api/saved | List saved services |
| POST | /api/saved/{id} | Save a service |
| DELETE | /api/saved/{id} | Remove saved service |
| GET | /api/messages | List messages |
| GET | /api/payments | List payments |
| POST | /api/payments | Process payment |

## Testing

### Health Check

```bash
curl http://localhost:3504/api/health
```

### Login

```bash
curl -X POST http://localhost:3504/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fery@remotiva.id","password":"password"}'
```

### Protected Route

```bash
curl http://localhost:3504/api/me \
  -H "Authorization: Bearer <your_token_here>"
```

## Demo Account

```
Email: fery@remotiva.id
Password: password
```

## Tech Stack

- **Framework**: FastAPI
- **Server**: Uvicorn
- **ORM**: SQLAlchemy
- **Database**: MySQL via PyMySQL
- **Auth**: JWT (PyJWT)
- **Password**: bcrypt
- **Config**: python-dotenv
