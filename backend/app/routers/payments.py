from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Service
from app.schemas import PaymentCreate, PaymentResponse
from app.repositories import OrderRepository


router = APIRouter(prefix="/api", tags=["payments"])


@router.get("/payments", response_model=list)
async def get_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get payment history (same as orders for now)."""
    from app.repositories import OrderRepository
    repo = OrderRepository(db)
    orders = repo.get_user_orders(current_user.id)
    return [
        {
            "id": o.id,
            "service_id": o.service_id,
            "service_title": o.service_title,
            "package_name": o.package_name,
            "status": o.status,
            "total_price": float(o.total_price),
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]


@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Process a payment for a service (creates order)."""
    from app.repositories import OrderRepository

    # Check if service exists
    service = db.query(Service).filter(Service.id == data.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="layanan tidak ditemukan",
        )

    repo = OrderRepository(db)
    package_name = data.package_name if data.package_name else "Standard"
    order = repo.create_order(
        user_id=current_user.id,
        service_id=data.service_id,
        package_name=package_name,
    )

    return PaymentResponse(
        status="created",
        order_id=order.id,
    )
