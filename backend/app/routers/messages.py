from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import MessageResponse
from app.repositories import MessageRepository


router = APIRouter(prefix="/api", tags=["messages"])


@router.get("/messages", response_model=List[MessageResponse])
async def get_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages for current user."""
    repo = MessageRepository(db)
    messages = repo.get_user_messages(current_user.id)
    return [
        MessageResponse(
            id=msg.id,
            initial=msg.initial,
            sender_name=msg.sender_name,
            last_message=msg.last_message,
            sent_at=msg.sent_at,
        )
        for msg in messages
    ]
