from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import ServiceResponse, SavedResponse, RemovedResponse
from app.repositories import SavedServiceRepository, ServiceRepository
from app.routers.services import _service_to_response


router = APIRouter(prefix="/api", tags=["saved"])


@router.get("/saved", response_model=List[ServiceResponse])
async def get_saved_services(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all saved services for current user."""
    repo = SavedServiceRepository(db)
    services = repo.get_saved_services(current_user.id)
    return [_service_to_response(s) for s in services]


@router.post("/saved/{service_id}", response_model=SavedResponse)
async def save_service(
    service_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a service for later."""
    repo = SavedServiceRepository(db)
    repo.save_service(current_user.id, service_id)
    return SavedResponse(saved=True)


@router.delete("/saved/{service_id}", response_model=RemovedResponse)
async def remove_saved_service(
    service_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a saved service."""
    repo = SavedServiceRepository(db)
    repo.remove_saved(current_user.id, service_id)
    return RemovedResponse(removed=True)
