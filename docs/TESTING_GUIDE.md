# Testing Guide - Role-Based Dashboard

## Database Setup

### Option 1: Fresh Database
```bash
cd database
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

### Option 2: Migration (existing database)
```bash
cd database
mysql -u root -p remotiva_db < migration_role_cs_payment.sql
```

## Test Accounts

### Admin Account
```
Email: admin@remotiva.id
Password: password
Role: admin
```

### Buyer Account
```
Email: fery@remotiva.id
Password: password
Role: buyer
```

### Seller Account
```
Email: nadia@remotiva.id
Password: password
Role: seller
```

## Manual Testing Checklist

### Phase 1: Auth & Role-Based Access

- [ ] Register as buyer → should redirect to `/app/buyer`
- [ ] Register as seller → should redirect to `/app/seller`
- [ ] Login as buyer → should redirect to `/app/buyer`
- [ ] Login as seller → should redirect to `/app/seller`
- [ ] Login as admin → should redirect to `/app/admin`
- [ ] Buyer cannot access `/app/seller` → should redirect to `/app/buyer`
- [ ] Buyer cannot access `/app/admin` → should redirect to `/app/buyer`
- [ ] Seller cannot access `/app/buyer` → should redirect to `/app/seller`
- [ ] Seller cannot access `/app/admin` → should redirect to `/app/seller`
- [ ] Cannot register as admin → should show error

### Phase 2: Admin Dashboard

- [ ] Admin can see all users in User Management table
- [ ] Admin can toggle user active/inactive
- [ ] Admin can change user role (buyer/seller/admin)
- [ ] Admin cannot deactivate themselves
- [ ] Admin cannot change their own role
- [ ] Admin sees stats: total users, active users, revenue, open tickets

### Phase 3: Buyer Dashboard

- [ ] Buyer sees welcome message with name
- [ ] Quick actions: Browse Services, Saved, Orders, Payments, Settings
- [ ] Tabs: Overview, Explore Services, Saved Services, My Orders
- [ ] Overview shows featured services and categories
- [ ] Customer Service button visible (bottom-right)

### Phase 4: Seller Dashboard

- [ ] Seller sees stats: Total Earnings, Total Orders, Active Orders, Completed
- [ ] Quick actions: Incoming Orders, Messages, Analytics, Settings
- [ ] Recent orders table
- [ ] Customer Service button visible (bottom-right)

### Phase 5: Customer Service

- [ ] Click CS button → popup opens
- [ ] Empty state: "Hi, how can we help you?"
- [ ] Click "New Conversation" → enter subject
- [ ] Thread created → can send messages
- [ ] Messages appear with alignment (user right, admin left)
- [ ] Admin can see all threads in CS Inbox tab
- [ ] Admin can filter threads by status
- [ ] Admin can reply to threads
- [ ] Admin can change thread status (open/pending/closed)

### Phase 6: Payment Simulation

- [ ] Select service → Click "Continue to Checkout"
- [ ] Payment method selection page appears
- [ ] Choose Virtual Account (BCA/Mandiri/BNI)
- [ ] Click "Continue to Payment"
- [ ] Payment modal appears with:
  - Payment method
  - Total amount
  - VA number (mock)
  - Instructions
  - "I Have Paid" button
- [ ] Click "I Have Paid" → success message
- [ ] Order appears in Orders page

### Phase 7: Inactive User

- [ ] Admin deactivates a user
- [ ] Inactive user tries to login
- [ ] Error: "Account is inactive. Please contact customer service."

## API Testing (curl)

### Login as Admin
```bash
curl -X POST http://localhost:3504/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@remotiva.id","password":"password"}'
```

### Get All Users (Admin)
```bash
curl http://localhost:3504/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

### Toggle User Active
```bash
curl -X PATCH http://localhost:3504/api/admin/users/2/toggle-active \
  -H "Authorization: Bearer <admin_token>"
```

### Create CS Thread
```bash
curl -X POST http://localhost:3504/api/customer-service/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{"subject":"Help with my order"}'
```

### Create Payment
```bash
curl -X POST http://localhost:3504/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{"order_id":1,"method":"virtual_account_bca"}'
```

### Mark Payment Paid
```bash
curl -X PATCH http://localhost:3504/api/payments/1/mark-paid \
  -H "Authorization: Bearer <user_token>"
```

## Troubleshooting

### Backend won't start
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3504
```

### Frontend won't build
```bash
cd frontend
npm install
npm run build
```

### Database connection error
Check `.env` file:
```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=remotiva_db
```

### Port already in use
```bash
# Find and kill process on port 3504
netstat -ano | findstr :3504
taskkill /PID <pid> /F
```
