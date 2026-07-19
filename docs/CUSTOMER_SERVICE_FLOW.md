# Customer Service Flow Documentation

## Overview

The Customer Service (CS) system in Remotiva provides a manual support system where buyers and sellers can create support threads and communicate with administrators. This is NOT an AI chatbot - all responses are handled manually by admin.

## User Roles and Access

| Role | Can Create Thread | Can View Own Threads | Can View All Threads | Can Reply to All |
|------|------------------|---------------------|---------------------|------------------|
| Buyer | ✓ | ✓ | ✗ | ✗ |
| Seller | ✓ | ✓ | ✗ | ✗ |
| Admin | ✗ | ✗ | ✓ | ✓ |

## Database Schema

### Tables

#### `customer_service_threads`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT AUTO_INCREMENT | Primary key |
| user_id | BIGINT | Foreign key to users.id |
| subject | VARCHAR(255) | Thread subject/topic |
| status | ENUM('open','pending','closed') | Thread status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `customer_service_messages`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT AUTO_INCREMENT | Primary key |
| thread_id | BIGINT | Foreign key to customer_service_threads.id |
| sender_id | BIGINT | Foreign key to users.id |
| sender_role | VARCHAR(20) | Role of sender (buyer/seller/admin) |
| message | TEXT | Message content |
| created_at | TIMESTAMP | Creation timestamp |

## API Endpoints

### Customer Service API (for Buyers/Sellers)

#### Create a new support thread
```
POST /api/customer-service/threads
Authorization: Bearer {token}

Request Body:
{
  "subject": "Masalah pembayaran"
}

Response (201 Created):
{
  "id": 1,
  "user_id": 2,
  "subject": "Masalah pembayaran",
  "status": "open",
  "created_at": "2026-07-19T10:00:00",
  "updated_at": "2026-07-19T10:00:00"
}
```

#### Get user's own threads
```
GET /api/customer-service/threads
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "user_id": 2,
    "user_name": "Nadia Studio",
    "user_role": "seller",
    "subject": "Masalah pembayaran",
    "status": "open",
    "created_at": "2026-07-19T10:00:00",
    "updated_at": "2026-07-19T10:00:00",
    "last_message": "Terima kasih atas bantuannya"
  }
]
```

#### Get thread messages
```
GET /api/customer-service/threads/{thread_id}/messages
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "thread_id": 1,
    "sender_id": 2,
    "sender_role": "seller",
    "sender_name": "Nadia Studio",
    "message": "Saya butuh bantuan...",
    "created_at": "2026-07-19T10:00:00"
  }
]
```

#### Send message to thread
```
POST /api/customer-service/threads/{thread_id}/messages
Authorization: Bearer {token}

Request Body:
{
  "message": "Isi pesan saya"
}

Response (201 Created):
{
  "id": 2,
  "thread_id": 1,
  "sender_id": 2,
  "sender_role": "seller",
  "sender_name": "Nadia Studio",
  "message": "Isi pesan saya",
  "created_at": "2026-07-19T10:05:00"
}
```

### Admin Customer Service API

#### Get all threads (admin only)
```
GET /api/admin/customer-service/threads
Authorization: Bearer {admin_token}

Query Parameters:
- status_filter (optional): open | pending | closed

Response (200 OK):
[
  {
    "id": 1,
    "user_id": 2,
    "user_name": "Nadia Studio",
    "user_role": "seller",
    "subject": "Masalah pembayaran",
    "status": "open",
    "created_at": "2026-07-19T10:00:00",
    "updated_at": "2026-07-19T10:00:00",
    "last_message": "Terima kasih atas bantuannya"
  },
  {
    "id": 2,
    "user_id": 3,
    "user_name": "Fery Firdaus",
    "user_role": "buyer",
    "subject": "Pertanyaan tentang pesanan",
    "status": "pending",
    "created_at": "2026-07-19T11:00:00",
    "updated_at": "2026-07-19T11:30:00",
    "last_message": "Admin sudah membantu"
  }
]
```

#### Get thread messages (admin only)
```
GET /api/admin/customer-service/threads/{thread_id}/messages
Authorization: Bearer {admin_token}

Response (200 OK):
[
  {
    "id": 1,
    "thread_id": 1,
    "sender_id": 2,
    "sender_role": "seller",
    "sender_name": "Nadia Studio",
    "message": "Saya butuh bantuan...",
    "created_at": "2026-07-19T10:00:00"
  },
  {
    "id": 2,
    "sender_id": 1,
    "sender_role": "admin",
    "sender_name": "Admin Remotiva",
    "message": "Baik, kami bantu cek",
    "created_at": "2026-07-19T10:10:00"
  }
]
```

#### Send admin reply (admin only)
```
POST /api/admin/customer-service/threads/{thread_id}/messages
Authorization: Bearer {admin_token}

Request Body:
{
  "message": "Baik, kami bantu cek"
}

Response (201 Created):
{
  "id": 3,
  "thread_id": 1,
  "sender_id": 1,
  "sender_role": "admin",
  "sender_name": "Admin Remotiva",
  "message": "Baik, kami bantu cek",
  "created_at": "2026-07-19T10:10:00"
}
```

#### Update thread status (admin only)
```
PATCH /api/admin/customer-service/threads/{thread_id}/status
Authorization: Bearer {admin_token}

Request Body:
{
  "status": "closed"
}

Response (200 OK):
{
  "id": 1,
  "user_id": 2,
  "subject": "Masalah pembayaran",
  "status": "closed",
  "created_at": "2026-07-19T10:00:00",
  "updated_at": "2026-07-19T12:00:00"
}
```

## Role Guards

### Buyer/Seller Endpoints
- All endpoints require valid JWT token
- Users can only access their own threads (verified in repository layer)
- Attempting to access another user's thread returns 404

### Admin Endpoints
- All endpoints require `require_admin` dependency
- Only users with role='admin' can access
- Non-admin users receive 403 Forbidden

## Frontend Implementation

### Buyer/Seller Customer Service Button
- Floating button in dashboard using `headset.svg` icon
- Opens popup with thread list
- Can create new thread by sending first message
- Only sees own threads

### Admin Customer Service Tab
- Located in Admin Dashboard under "Bantuan Pelanggan" tab
- Shows all threads from all users
- Displays user role badge (Pembeli/Penjual)
- Can reply to any thread
- Can update thread status

## Status Flow

```
open → pending → closed
```

- **open**: Initial status, awaiting response
- **pending**: Admin is working on it
- **closed**: Issue resolved, thread archived

## Security Notes

1. **No Cross-User Access**: Buyer/Seller cannot see or access other users' threads
2. **Admin Verification**: All admin endpoints are protected by `require_admin` dependency
3. **Token Validation**: All endpoints require valid JWT token
4. **CASCADE Delete**: Thread deletion removes all associated messages

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@remotiva.id | password | Admin |
| fery@remotiva.id | password | Buyer |
| nadia@remotiva.id | password | Seller |

## Testing Checklist

1. Login as seller (nadia@remotiva.id)
2. Open customer service popup
3. Send a message to create a thread
4. Login as admin (admin@remotiva.id)
5. Navigate to Bantuan Pelanggan tab
6. Verify thread appears in admin list
7. Open thread and send reply
8. Login as seller again
9. Verify admin reply appears in seller's thread
