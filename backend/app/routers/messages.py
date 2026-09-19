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
from sqlalchemy import select, or_, update

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.message import ChatMessage
from app.models.client import Client
from app.models.user import User
from app.schemas.message import (
    ChatMessageCreate, 
    ChatMessageResponse, 
    MarkReadRequest, 
    MessageReactRequest
)
from app.services.events import sse_manager
from app.services.notifications import message_debouncer

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
    if msg_in.client_msg_id and msg_in.client_msg_id.strip():
        # Idempotency check: if message with this clientMsgId already exists, return it
        c_exist = await db.execute(select(ChatMessage).where(ChatMessage.id == msg_in.client_msg_id.strip()))
        existing_msg = c_exist.scalar_one_or_none()
        if existing_msg:
            return existing_msg
        msg_id = msg_in.client_msg_id.strip()
    else:
        msg_id = f"msg-{int(time.time() * 1000)}"
    
    new_msg = ChatMessage(
        id=msg_id,
        coach_id=coach_id,
        client_id=msg_in.client_id,
        sender=msg_in.sender,
        text=msg_in.text,
        timestamp=now_str,
        is_read=False,
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
                    "clientMsgId": msg_in.client_msg_id or new_msg.id,
                    "clientId": new_msg.client_id,
                    "coachId": new_msg.coach_id,
                    "sender": new_msg.sender,
                    "text": new_msg.text,
                    "timestamp": new_msg.timestamp,
                    "isRead": new_msg.is_read,
                    "attachment": new_msg.attachment
                },
                target_client_id=new_msg.client_id,
                target_coach_id=coach_id
            )
        )
    except Exception as sse_err:
        logger.warning(f"Failed to trigger SSE broadcast for message: {sse_err}")

    # Presence-aware debounced email notification (suppressed if recipient is active on platform)
    try:
        if msg_in.sender == "client" or current_user.role != "coach":
            # Speaker messaged coach -> Notify coach if offline
            coach_email = settings.DEFAULT_COACH_EMAIL
            coach_name = settings.DEFAULT_COACH_NAME
            if coach_id:
                c_res = await db.execute(select(User).where(User.id == coach_id))
                coach = c_res.scalar_one_or_none()
                if coach and coach.email:
                    coach_email = coach.email
                    coach_name = coach.full_name or settings.DEFAULT_COACH_NAME

            speaker_name = client.name if client else "Orator"
            await message_debouncer.queue_message_notification(
                recipient_email=coach_email,
                recipient_name=coach_name,
                sender_name=speaker_name,
                sender_role="Speaker",
                message_snippet=msg_in.text,
                thread_url=f"{settings.APP_URL}/coach",
                user_id=coach_id,
                client_id=None
            )
        else:
            # Coach messaged speaker -> Notify speaker if offline
            if client and client.email:
                await message_debouncer.queue_message_notification(
                    recipient_email=client.email,
                    recipient_name=client.name,
                    sender_name=current_user.full_name or "Faculty Coach",
                    sender_role="Coach",
                    message_snippet=msg_in.text,
                    thread_url=f"{settings.APP_URL}/speaker",
                    user_id=None,
                    client_id=client.id
                )
    except Exception as notify_err:
        logger.error(f"Failed to queue debounced message notification: {notify_err}")

    return new_msg


@router.post("/mark-read")
async def mark_messages_read(
    body: MarkReadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark incoming messages in a thread as read and broadcast SSE read receipt."""
    other_sender = "client" if current_user.role == "coach" else "coach"
    await db.execute(
        update(ChatMessage)
        .where(
            ChatMessage.client_id == body.client_id,
            ChatMessage.sender == other_sender,
            ChatMessage.is_read == False
        )
        .values(is_read=True)
    )
    await db.commit()

    c_res = await db.execute(select(Client).where(Client.id == body.client_id))
    client = c_res.scalar_one_or_none()
    coach_id = client.coach_id if client else None

    # Broadcast real-time read event
    try:
        asyncio.create_task(
            sse_manager.broadcast(
                event="messages_read",
                data={
                    "clientId": body.client_id,
                    "readerRole": current_user.role,
                    "readerId": current_user.id
                },
                target_client_id=body.client_id,
                target_coach_id=coach_id
            )
        )
    except Exception as e:
        logger.debug(f"Failed to broadcast messages_read: {e}")

    return {"status": "ok", "clientId": body.client_id}


@router.patch("/{message_id}/react", response_model=ChatMessageResponse)
async def react_to_message(
    message_id: str,
    body: MessageReactRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle emoji reaction on a message (WhatsApp style)."""
    res = await db.execute(select(ChatMessage).where(ChatMessage.id == message_id))
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    attachment = dict(msg.attachment) if msg.attachment else {}
    reactions = list(attachment.get("reactions", []))

    user_id = current_user.id
    existing_idx = next(
        (i for i, r in enumerate(reactions) if r.get("userId") == user_id and r.get("emoji") == body.emoji),
        None
    )

    if existing_idx is not None:
        reactions.pop(existing_idx)
    else:
        reactions.append({
            "emoji": body.emoji,
            "userId": user_id,
            "senderRole": current_user.role,
            "userName": current_user.full_name or ("Coach" if current_user.role == "coach" else "Speaker")
        })

    attachment["reactions"] = reactions
    msg.attachment = attachment
    await db.commit()
    await db.refresh(msg)

    # Broadcast reaction via SSE
    try:
        asyncio.create_task(
            sse_manager.broadcast(
                event="message_reaction",
                data={
                    "messageId": msg.id,
                    "clientId": msg.client_id,
                    "reactions": reactions
                },
                target_client_id=msg.client_id,
                target_coach_id=msg.coach_id
            )
        )
    except Exception as e:
        logger.debug(f"Failed to broadcast message_reaction: {e}")

    return msg


@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a chat message and broadcast real-time deletion event."""
    res = await db.execute(select(ChatMessage).where(ChatMessage.id == message_id))
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    # Author or coach can delete
    if current_user.role != "coach" and msg.sender != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete other users' messages")

    client_id = msg.client_id
    coach_id = msg.coach_id
    await db.delete(msg)
    await db.commit()

    # Broadcast deletion via SSE
    try:
        asyncio.create_task(
            sse_manager.broadcast(
                event="message_deleted",
                data={
                    "messageId": message_id,
                    "clientId": client_id
                },
                target_client_id=client_id,
                target_coach_id=coach_id
            )
        )
    except Exception as e:
        logger.debug(f"Failed to broadcast message_deleted: {e}")

    return {"status": "ok", "messageId": message_id}


@router.get("/presence")
async def get_messages_presence(
    current_user: User = Depends(get_current_user)
):
    """Get online presence snapshot of connected users and speaker clients."""
    return sse_manager.get_presence_snapshot()

