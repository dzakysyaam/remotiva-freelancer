from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import (
    Preferences,
    ProfileResponse,
    UpdatedResponse,
    UserResponse,
)
from app.repositories import UserProfileRepository


router = APIRouter(prefix="/api", tags=["profile"])


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user profile with preferences and interests."""
    repo = UserProfileRepository(db)
    prefs, interests = repo.get_profile(current_user.id)

    # Convert preferences dict to Preferences object
    preferences = Preferences(**prefs) if isinstance(prefs, dict) else prefs

    return ProfileResponse(
        preferences=preferences,
        interests=interests if interests else [],
    )


@router.patch("/profile/preferences", response_model=UpdatedResponse)
async def update_preferences(
    preferences: Preferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user preferences."""
    repo = UserProfileRepository(db)
    repo.update_preferences(
        current_user.id,
        preferences.model_dump(),
    )
    return UpdatedResponse(updated=True)


@router.patch("/profile/interests", response_model=UpdatedResponse)
async def update_interests(
    interests: List[str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user interests."""
    repo = UserProfileRepository(db)
    repo.update_interests(current_user.id, interests)
    return UpdatedResponse(updated=True)
