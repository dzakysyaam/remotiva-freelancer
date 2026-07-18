# Customer Service Plan

## Scope

Implementasi customer service chat system:
1. Floating CS button di semua dashboard
2. Chat popup window
3. Thread-based conversation
4. Admin inbox untuk manage semua CS threads

## Affected Files

### Database
- `database/schema.sql` - Tambah tabel customer_service_threads dan customer_service_messages

### Backend
- `backend/app/models/__init__.py` - Tambah models
- `backend/app/routers/customer_service.py` - **NEW** User CS routes
- `backend/app/routers/admin_cs.py` - **NEW** Admin CS routes
- `backend/app/routers/__init__.py` - Export routers

### Frontend
- `frontend/src/components/customer-service/` - **NEW** CS components
  - CustomerServiceButton.jsx
  - CustomerServicePopup.jsx
  - CustomerServiceChat.jsx
- `frontend/src/pages/buyer/BuyerDashboard.jsx` - Include CS button
- `frontend/src/pages/seller/SellerDashboard.jsx` - Include CS button
- `frontend/src/pages/admin/AdminDashboard.jsx` - Include CS inbox

## Database Schema

```sql
CREATE TABLE customer_service_threads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('open', 'pending', 'closed') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE customer_service_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thread_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES customer_service_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

## API Changes

### User CS Routes
```
GET    /api/customer-service/threads                - List user's threads
POST   /api/customer-service/threads               - Create new thread
GET    /api/customer-service/threads/{id}           - Get thread detail
GET    /api/customer-service/threads/{id}/messages  - Get thread messages
POST   /api/customer-service/threads/{id}/messages  - Send message
```

### Admin CS Routes
```
GET    /api/admin/customer-service/threads                - List all threads
GET    /api/admin/customer-service/threads/{id}           - Get thread detail
GET    /api/admin/customer-service/threads/{id}/messages   - Get messages
POST   /api/admin/customer-service/threads/{id}/messages  - Reply
PATCH  /api/admin/customer-service/threads/{id}/status    - Update status
```

## Frontend Components

### CustomerServiceButton
- Floating button bottom-right corner
- Blue #2D76FF background
- Headset/message icon
- Click opens popup

### CustomerServicePopup
- Modal overlay
- Header: "Customer Service"
- Thread list untuk existing threads
- Tombol "New Conversation"
- Close button

### CustomerServiceChat
- Message list (scrollable)
- User messages: right-aligned, blue background
- Admin messages: left-aligned, gray background
- Input field + Send button
- Status indicator

## Acceptance Criteria

1. [ ] CS button muncul di buyer dashboard
2. [ ] CS button muncul di seller dashboard
3. [ ] CS button muncul di admin dashboard (different - shows inbox)
4. [ ] User bisa buat thread baru
5. [ ] User bisa kirim message
6. [ ] User bisa lihat response
7. [ ] Admin bisa lihat semua threads
8. [ ] Admin bisa filter by status
9. [ ] Admin bisa reply to thread
10. [ ] Admin bisa close thread

## What Is NOT Included

- Real-time WebSocket (polling only for MVP)
- AI/chatbot responses
- File attachments
- Read receipts
- Typing indicators
- Push notifications
