from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas import ServiceResponse
from app.repositories import ServiceRepository
from app.rate_limiter import rate_limiter


router = APIRouter(prefix="/api", tags=["services"])


@router.get("/services", response_model=List[ServiceResponse])
async def get_services(
    request: Request,
    category: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Get list of services with optional filters."""
    # Rate limit: 60 requests per minute per IP
    allowed, response = rate_limiter.is_allowed(request, limit=60, path_prefix="/api/services")
    if not allowed:
        return response

    repo = ServiceRepository(db)
    services = repo.get_all(category=category, query=q, limit=limit)
    return [_service_to_response(s) for s in services]


@router.get("/services/{service_id}", response_model=ServiceResponse)
async def get_service(request: Request, service_id: int, db: Session = Depends(get_db)):
    """Get a single service by ID."""
    # Rate limit: 120 requests per minute per IP
    allowed, response = rate_limiter.is_allowed(request, limit=120, path_prefix="/api/services/")
    if not allowed:
        return response

    repo = ServiceRepository(db)
    service = repo.get_by_id(service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="layanan tidak ditemukan",
        )
    return _service_to_response(service)


def _service_to_response(s) -> ServiceResponse:
    """Convert service row to response schema."""
    return ServiceResponse(
        id=s.id,
        category_id=s.category_id,
        category_slug=s.category_slug,
        seller_id=s.seller_id,
        seller_name=s.seller_name,
        seller_level=s.seller_level,
        title=s.title,
        description=s.description,
        image_url=s.image_url,
        price=float(s.price),
        rating=float(s.rating) if s.rating else 0.0,
        delivery_days=s.delivery_days,
        is_featured=s.is_featured,
    )
