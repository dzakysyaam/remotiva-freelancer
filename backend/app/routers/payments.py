from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import PaymentCreate, PaymentResponse, PaymentStatusResponse
from app.repositories import PaymentRepository, OrderRepository


router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("", response_model=List[PaymentResponse])
async def get_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get payment history for current user."""
    repo = PaymentRepository(db)
    payments = repo.get_user_payments(current_user.id)
    return [
        PaymentResponse(
            id=p.id,
            order_id=p.order_id,
            method=p.method,
            amount=float(p.amount),
            fee=float(p.fee),
            total_amount=float(p.total_amount),
            status=p.status,
            payment_code=p.payment_code,
            va_number=p.va_number,
            expiry_time=p.expiry_time,
            created_at=p.created_at,
            paid_at=p.paid_at,
        )
        for p in payments
    ]


@router.get("/stats")
async def get_payment_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get payment statistics for admin."""
    repo = PaymentRepository(db)
    return repo.get_stats()


@router.post("/create", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a payment for an order."""
    # Only buyers can create payments
    if current_user.role != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create payments.",
        )

    # Verify order belongs to user
    order_repo = OrderRepository(db)
    payment_repo = PaymentRepository(db)

    # Check if order exists
    from app.models import Order, Service
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Check if payment already exists
    existing = payment_repo.get_order_payment(data.order_id)
    if existing:
        return PaymentResponse(
            id=existing.id,
            order_id=existing.order_id,
            method=existing.method,
            amount=float(existing.amount),
            fee=float(existing.fee),
            total_amount=float(existing.total_amount),
            status=existing.status,
            payment_code=existing.payment_code,
            va_number=existing.va_number,
            expiry_time=existing.expiry_time,
            created_at=existing.created_at,
            paid_at=existing.paid_at,
        )

    # Calculate fee (5%)
    amount = float(order.total_price)
    fee = round(amount * 0.05, 2)

    payment = payment_repo.create_payment(
        order_id=data.order_id,
        user_id=current_user.id,
        method=data.method,
        amount=amount,
        fee=fee,
    )

    return PaymentResponse(
        id=payment.id,
        order_id=payment.order_id,
        method=payment.method,
        amount=float(payment.amount),
        fee=float(payment.fee),
        total_amount=float(payment.total_amount),
        status=payment.status,
        payment_code=payment.payment_code,
        va_number=payment.va_number,
        expiry_time=payment.expiry_time,
        created_at=payment.created_at,
        paid_at=payment.paid_at,
    )


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get payment details."""
    repo = PaymentRepository(db)
    payment = repo.get_payment(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return PaymentResponse(
        id=payment.id,
        order_id=payment.order_id,
        method=payment.method,
        amount=float(payment.amount),
        fee=float(payment.fee),
        total_amount=float(payment.total_amount),
        status=payment.status,
        payment_code=payment.payment_code,
        va_number=payment.va_number,
        expiry_time=payment.expiry_time,
        created_at=payment.created_at,
        paid_at=payment.paid_at,
    )


@router.patch("/{payment_id}/mark-paid", response_model=PaymentStatusResponse)
async def mark_payment_paid(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark payment as paid (simulated)."""
    repo = PaymentRepository(db)
    payment = repo.get_payment(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    if payment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment cannot be marked as paid. Current status: {payment.status}",
        )

    updated = repo.mark_paid(payment_id)
    return PaymentStatusResponse(
        status="paid",
        message="Payment marked as paid successfully. Order is now in progress.",
    )


@router.patch("/{payment_id}/mark-failed", response_model=PaymentStatusResponse)
async def mark_payment_failed(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark payment as failed (simulated)."""
    repo = PaymentRepository(db)
    payment = repo.get_payment(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    if payment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment cannot be marked as failed. Current status: {payment.status}",
        )

    repo.mark_failed(payment_id)
    return PaymentStatusResponse(
        status="failed",
        message="Payment marked as failed.",
    )
