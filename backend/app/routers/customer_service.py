from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import CSThreadCreate, CSThreadResponse, CSMessageCreate, CSMessageResponse
from app.repositories import CustomerServiceRepository


router = APIRouter(prefix="/api/customer-service", tags=["customer-service"])


@router.get("/threads", response_model=List[CSThreadResponse])
async def get_threads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all customer service threads for current user."""
    repo = CustomerServiceRepository(db)
    threads = repo.get_user_threads(current_user.id)
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


@router.post("/threads", response_model=CSThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    data: CSThreadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new customer service thread."""
    repo = CustomerServiceRepository(db)
    thread = repo.create_thread(current_user.id, data.subject)

    # Create initial message
    repo.create_message(
        thread_id=thread.id,
        sender_id=current_user.id,
        sender_role=current_user.role,
        message=f"Aktifitas ini terkait: {data.subject}"
    )

    return CSThreadResponse(
        id=thread.id,
        user_id=thread.user_id,
        subject=thread.subject,
        status=thread.status,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
    )


@router.get("/threads/{thread_id}", response_model=CSThreadResponse)
async def get_thread(
    thread_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific customer service thread."""
    repo = CustomerServiceRepository(db)
    thread = repo.get_thread_by_user(thread_id, current_user.id)
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages for a customer service thread."""
    repo = CustomerServiceRepository(db)

    # Verify user has access to this thread
    thread = repo.get_thread_by_user(thread_id, current_user.id)
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message to a customer service thread."""
    repo = CustomerServiceRepository(db)

    # Verify user has access to this thread
    thread = repo.get_thread_by_user(thread_id, current_user.id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    message = repo.create_message(
        thread_id=thread_id,
        sender_id=current_user.id,
        sender_role=current_user.role,
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
