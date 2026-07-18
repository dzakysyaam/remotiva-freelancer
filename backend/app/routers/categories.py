from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import CategoryResponse
from app.repositories import CategoryRepository
from app.rate_limiter import rate_limiter


router = APIRouter(prefix="/api", tags=["categories"])


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(request: Request, db: Session = Depends(get_db)):
    """Get all categories."""
    # Rate limit: 60 requests per minute per IP
    allowed, response = rate_limiter.is_allowed(request, limit=60, path_prefix="/api/categories")
    if not allowed:
        return response

    repo = CategoryRepository(db)
    categories = repo.get_all()
    return [
        CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            icon=cat.icon,
            description=cat.description,
        )
        for cat in categories
    ]
