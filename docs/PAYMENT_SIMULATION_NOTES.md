# PAYMENT SIMULATION NOTES

## Overview
Implemented realistic payment simulation for Remotiva marketplace checkout.

## Payment Methods

### 1. Credit/Debit Card
**Fields:**
- Card Number (16 digits)
- Cardholder Name
- Expiry Date (MM/YY)
- CVV (3-4 digits)

**Validation:**
- Card number format check (basic)
- Expiry date format check
- All fields required

**Simulation Flow:**
1. User fills card form
2. Click "Pay Now"
3. Show processing state (1.5s)
4. Mark payment as PAID
5. Show success screen

### 2. Bank Transfer (Virtual Account)
**Supported Banks:**
- BCA Virtual Account
- Mandiri Virtual Account
- BNI Virtual Account
- BRI Virtual Account
- Bank Transfer (General)

**VA Generation:**
- Fake VA number generated: `8800 + random 12 digits`
- Format: `XXXX XXXX XXXX XXXX`

**UI Display:**
- Bank logo/name
- Virtual account number
- Total amount
- Payment deadline (24 hours)
- Copy button for VA number
- "I Have Paid" button

**Simulation Flow:**
1. User selects bank
2. System generates fake VA
3. Show payment instruction modal
4. User clicks "I Have Paid"
5. Payment marked as PAID

### 3. QR Payment (QRIS Simulation)
**QR Content:**
- Format: `REMOTIVA-{orderId}-{amount}-{timestamp}`
- Displayed as QR code image

**UI Display:**
- QR code image (placeholder or generated)
- Order ID
- Total amount
- Payment deadline
- "Simulate QR Scanned" button
- "Mark as Paid" button

**Simulation Flow:**
1. User selects QR Payment
2. System generates QR payload
3. Show QR code modal
4. User clicks "Simulate Payment"
5. Payment marked as PAID

## Payment Status

| Status | Description |
|--------|-------------|
| pending | Payment created, awaiting payment |
| waiting_payment | User shown payment instructions |
| paid | Payment confirmed |
| failed | Payment failed |
| expired | Payment deadline passed |

## Order Status Flow

```
pending -> paid -> in_progress -> completed
                 -> cancelled
```

## Backend Integration

### Role Check (orders.py)
```python
if current_user.role != "buyer":
    raise HTTPException(
        status_code=403,
        detail="Only buyers can create orders.",
    )
```

### Role Check (payments.py)
```python
if current_user.role != "buyer":
    raise HTTPException(
        status_code=403,
        detail="Only buyers can create payments.",
    )
```

### API Endpoints
- `POST /api/orders` - Create order (buyer only)
- `POST /api/payments/create` - Create payment (buyer only)
- `PATCH /api/payments/{id}/mark-paid` - Mark paid
- `GET /api/payments` - Get payment history

## Frontend Files
- `frontend/src/pages/ServiceDetail.jsx` - Checkout & payment UI
- `frontend/src/components/payment/` - Payment components (future)

## UI/UX Guidelines

### Colors
- Primary: #2D76FF (buttons, headers)
- Success: #2D76FF (success states)
- Warning: #D97706 (payment expiry)
- Neutral backgrounds: #F8FAFC

### Typography
- Headings: Montserrat Bold
- Body: Montserrat Regular
- Monospace for VA numbers

### Animations
- Modal slide-in: 0.3s ease-out
- Button hover: scale(1.02)
- Processing spinner: CSS animation

## Implementation Date
2026-07-18
