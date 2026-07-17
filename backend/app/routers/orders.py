from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Service
from app.schemas import OrderResponse, OrderCreate, OrderStatusResponse
from app.repositories import OrderRepository


router = APIRouter(prefix="/api", tags=["orders"])


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all orders for current user."""
    repo = OrderRepository(db)
    orders = repo.get_user_orders(current_user.id)
    return [
        OrderResponse(
            id=o.id,
            service_id=o.service_id,
            service_title=o.service_title,
            package_name=o.package_name,
            status=o.status,
            total_price=float(o.total_price),
            created_at=o.created_at,
        )
        for o in orders
    ]


@router.post("/orders", response_model=OrderStatusResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new order."""
    repo = OrderRepository(db)

    # Check if service exists
    service = db.query(Service).filter(Service.id == data.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="layanan tidak ditemukan",
        )

    # Create order
    package_name = data.package_name if data.package_name else "Standard"
    order = repo.create_order(
        user_id=current_user.id,
        service_id=data.service_id,
        package_name=package_name,
    )

    return OrderStatusResponse(status="created")
