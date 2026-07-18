from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import require_admin
from app.models import User
from app.schemas import UserListResponse, UserRoleUpdate, UserToggleResponse
from app.repositories import UserRepository


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[UserListResponse])
async def get_all_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all users (admin only)."""
    repo = UserRepository(db)
    users = repo.get_all_users()
    return [
        UserListResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.patch("/users/{user_id}/toggle-active", response_model=UserToggleResponse)
async def toggle_user_active(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Toggle user active status (admin only)."""
    # Prevent admin from deactivating themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )

    repo = UserRepository(db)
    user = repo.toggle_user_active(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserToggleResponse(id=user.id, is_active=user.is_active)


@router.patch("/users/{user_id}/role", response_model=UserListResponse)
async def update_user_role(
    user_id: int,
    data: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update user role (admin only)."""
    # Validate role
    if data.role not in ["buyer", "seller", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be buyer, seller, or admin",
        )

    # Prevent admin from changing their own role
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role",
        )

    repo = UserRepository(db)
    user = repo.update_user_role(user_id, data.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserListResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )
