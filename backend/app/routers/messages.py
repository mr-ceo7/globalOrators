"""
Chat Messages Router
"""

import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.message import ChatMessage
from app.models.client import Client
from app.models.user import User
from app.schemas.message import ChatMessageCreate, ChatMessageResponse

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("", response_model=List[ChatMessageResponse])
async def list_messages(
    client_id: Optional[str] = Query(None, alias="clientId"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List chat messages with coach isolation and speaker authorization."""
    query = select(ChatMessage)
    
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if client_id:
            # Check client belongs to coach
            c_res = await db.execute(select(Client).where(Client.id == client_id))
            client = c_res.scalar_one_or_none()
            if not is_default_coach and client and client.coach_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: speaker messages belong to another coach"
                )
            query = query.where(ChatMessage.client_id == client_id)
        else:
            if is_default_coach:
                query = query.where(or_(ChatMessage.coach_id == current_user.id, ChatMessage.coach_id.is_(None)))
            else:
                query = query.where(ChatMessage.coach_id == current_user.id)
    else:
        # Speaker
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator message threads"
                )
            query = query.where(ChatMessage.client_id == client_id)
        else:
            query = query.where(ChatMessage.client_id.in_(speaker_ids))
            
    result = await db.execute(query.order_by(ChatMessage.id.asc()))
    return result.scalars().all()


@router.post("", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    msg_in: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a new message with coach isolation."""
    c_res = await db.execute(select(Client).where(Client.id == msg_in.client_id))
    client = c_res.scalar_one_or_none()
    
    coach_id = None
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if client and not is_default_coach and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: cannot message speakers of another coach"
            )
        coach_id = current_user.id
    else:
        if client and client.email and client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to send messages for other speakers"
            )
        coach_id = client.coach_id if client else None
        
    now_str = datetime.now().strftime("%I:%M %p")
    msg_id = f"msg-{int(time.time() * 1000)}"
    
    new_msg = ChatMessage(
        id=msg_id,
        coach_id=coach_id,
        client_id=msg_in.client_id,
        sender=msg_in.sender,
        text=msg_in.text,
        timestamp=now_str,
        is_read=True,
        attachment=msg_in.attachment
    )
    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)
    return new_msg
