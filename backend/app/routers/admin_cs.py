from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.dependencies import require_admin
from app.models import User
from app.schemas import CSThreadResponse, CSMessageCreate, CSMessageResponse, CSStatusUpdate
from app.repositories import CustomerServiceRepository


router = APIRouter(prefix="/api/admin/customer-service", tags=["admin-customer-service"])


@router.get("/threads", response_model=List[CSThreadResponse])
async def get_all_threads(
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all customer service threads (admin only)."""
    repo = CustomerServiceRepository(db)
    threads = repo.get_all_threads(status_filter)
    return [
        CSThreadResponse(
            id=t["id"],
            user_id=t["user_id"],
            user_name=t["user_name"],
            subject=t["subject"],
            status=t["status"],
            created_at=t["created_at"],
            updated_at=t["updated_at"],
            last_message=t["last_message"],
        )
        for t in threads
    ]


@router.get("/threads/{thread_id}", response_model=CSThreadResponse)
async def get_thread(
    thread_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get a specific customer service thread (admin only)."""
    repo = CustomerServiceRepository(db)
    thread = repo.get_thread(thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    return CSThreadResponse(
        id=thread.id,
        user_id=thread.user_id,
        subject=thread.subject,
        status=thread.status,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
    )


@router.get("/threads/{thread_id}/messages", response_model=List[CSMessageResponse])
async def get_thread_messages(
    thread_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all messages for a customer service thread (admin only)."""
    repo = CustomerServiceRepository(db)

    thread = repo.get_thread(thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    messages = repo.get_thread_messages(thread_id)
    return [
        CSMessageResponse(
            id=m["id"],
            thread_id=m["thread_id"],
            sender_id=m["sender_id"],
            sender_role=m["sender_role"],
            sender_name=m["sender_name"],
            message=m["message"],
            created_at=m["created_at"],
        )
        for m in messages
    ]


@router.post("/threads/{thread_id}/messages", response_model=CSMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    thread_id: int,
    data: CSMessageCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Send a message as admin to a customer service thread."""
    repo = CustomerServiceRepository(db)

    thread = repo.get_thread(thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    message = repo.create_message(
        thread_id=thread_id,
        sender_id=current_user.id,
        sender_role="admin",
        message=data.message,
    )

    return CSMessageResponse(
        id=message.id,
        thread_id=message.thread_id,
        sender_id=message.sender_id,
        sender_role=message.sender_role,
        sender_name=current_user.name,
        message=message.message,
        created_at=message.created_at,
    )


@router.patch("/threads/{thread_id}/status", response_model=CSThreadResponse)
async def update_thread_status(
    thread_id: int,
    data: CSStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update thread status (admin only)."""
    if data.status not in ["open", "pending", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be open, pending, or closed",
        )

    repo = CustomerServiceRepository(db)
    thread = repo.update_thread_status(thread_id, data.status)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    return CSThreadResponse(
        id=thread.id,
        user_id=thread.user_id,
        subject=thread.subject,
        status=thread.status,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
    )
