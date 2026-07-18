# Payment Simulation Plan

## Scope

Implementasi payment simulation dengan Midtrans-style UX:
1. Mock payment gateway modal
2. Virtual account / bank transfer / e-wallet / QRIS mock
3. Simulated success/failure
4. Payment history tracking

## Affected Files

### Database
- `database/schema.sql` - Tambah tabel payments

### Backend
- `backend/app/models/__init__.py` - Tambah Payment model
- `backend/app/routers/payments.py` - Extend existing payments router
- `backend/app/schemas/__init__.py` - Tambah payment schemas
- `backend/app/repositories/__init__.py` - Tambah PaymentRepository

### Frontend
- `frontend/src/components/payment/` - **NEW** Payment components
  - PaymentMethodSelector.jsx
  - PaymentGatewayModal.jsx
  - VirtualAccountDisplay.jsx
  - PaymentSuccess.jsx
- `frontend/src/pages/buyer/BuyerDashboard.jsx` - Payment history section
- `frontend/src/pages/ServiceDetail.jsx` - Update checkout flow

## Database Schema

```sql
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'expired') NOT NULL DEFAULT 'pending',
    payment_code VARCHAR(100),
    va_number VARCHAR(50),
    expiry_time TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Changes

### Existing Modified
- `POST /api/orders` - Create payment record alongside order
- `GET /api/orders` - Include payment status

### New Endpoints
```
GET    /api/payments                    - List user's payments
GET    /api/payments/{id}               - Get payment detail
POST   /api/payments/create             - Create payment (after order)
PATCH  /api/payments/{id}/mark-paid    - Simulate payment success
PATCH  /api/payments/{id}/mark-failed  - Simulate payment failure
POST   /api/payments/{id}/expire       - Mark as expired
```

## Payment Methods

1. **Virtual Account**
   - BCA Virtual Account
   - Mandiri Virtual Account
   - BNI Virtual Account
   - BRI Virtual Account

2. **Bank Transfer**
   - Direct bank transfer

3. **E-Wallet**
   - GoPay
   - OVO
   - DANA

4. **QRIS**
   - QRIS Mock (display QR code placeholder)

## Payment Flow

```
1. User select service -> Click "Pesan"
2. Checkout page -> Select package -> Click "Lanjutkan"
3. Payment page -> Select payment method -> Click "Bayar Sekarang"
4. Modal popup:
   - Payment method icon
   - Total amount
   - Payment code / VA number
   - Countdown timer (mock: 24 hours)
   - "Saya Sudah Bayar" button (blue #2D76FF)
   - "Batalkan" button
5. User click "Saya Sudah Bayar"
6. Payment status -> paid
7. Order status -> updated
8. Success confirmation page
```

## Frontend Components

### PaymentMethodSelector
- Grid of payment method options
- Selected state: blue border
- Method icons

### PaymentGatewayModal
- Overlay modal
- Payment method header
- Amount display
- VA number / payment code
- Mock countdown timer
- Action buttons

### PaymentSuccess
- Success icon (check circle)
- Payment ID
- Amount paid
- Order reference
- "Kembali ke Pesanan" button

## Acceptance Criteria

1. [ ] User bisa pilih payment method
2. [ ] Payment modal muncul setelah pilih method
3. [ ] VA number / payment code displayed
4. [ ] User bisa click "Saya Sudah Bayar"
5. [ ] Payment status updated to paid
6. [ ] Order status updated
7. [ ] User bisa lihat payment history
8. [ ] User bisa cancel payment
9. [ ] No real card data collected
10. [ ] No real payment gateway integrated

## What Is NOT Included

- Real Midtrans integration
- Real payment gateway
- PCI-compliant card processing
- Real bank API
- Real e-wallet integration
- Production payment flow
