"""
Chat Messages Router
"""

import time
import asyncio
import logging
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
from app.services.email import send_direct_message_email
from app.services.events import sse_manager

logger = logging.getLogger("globalorators.messages")
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

    # Dispatch real-time SSE event
    try:
        asyncio.create_task(
            sse_manager.broadcast(
                event="new_message",
                data={
                    "id": new_msg.id,
                    "clientId": new_msg.client_id,
                    "coachId": new_msg.coach_id,
                    "sender": new_msg.sender,
                    "text": new_msg.text,
                    "timestamp": new_msg.timestamp,
                    "attachment": new_msg.attachment
                },
                target_client_id=new_msg.client_id,
                target_coach_id=coach_id
            )
        )
    except Exception as sse_err:
        logger.warning(f"Failed to trigger SSE broadcast for message: {sse_err}")

    # Dispatch direct message email notification
    try:
        if msg_in.sender == "client" or current_user.role != "coach":
            # Speaker messaged coach -> Notify coach
            coach_email = settings.DEFAULT_COACH_EMAIL
            coach_name = settings.DEFAULT_COACH_NAME
            if coach_id:
                c_res = await db.execute(select(User).where(User.id == coach_id))
                coach = c_res.scalar_one_or_none()
                if coach and coach.email:
                    coach_email = coach.email
                    coach_name = coach.full_name or settings.DEFAULT_COACH_NAME

            speaker_name = client.name if client else "Orator"
            asyncio.create_task(
                send_direct_message_email(
                    recipient_email=coach_email,
                    recipient_name=coach_name,
                    sender_name=speaker_name,
                    sender_role="Speaker",
                    message_snippet=msg_in.text,
                    thread_url=f"{settings.APP_URL}/coach"
                )
            )
        else:
            # Coach messaged speaker -> Notify speaker
            if client and client.email:
                asyncio.create_task(
                    send_direct_message_email(
                        recipient_email=client.email,
                        recipient_name=client.name,
                        sender_name=current_user.full_name or "Faculty Coach",
                        sender_role="Coach",
                        message_snippet=msg_in.text,
                        thread_url=f"{settings.APP_URL}/speaker"
                    )
                )
    except Exception as notify_err:
        logger.error(f"Failed to dispatch message notification: {notify_err}")

    return new_msg
