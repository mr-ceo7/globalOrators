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
from app.models.group import ChatGroup
from app.schemas.message import (
    ChatMessageCreate, 
    ChatMessageResponse, 
    MarkReadRequest, 
    MessageReactRequest,
    TypingIndicatorRequest
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
    """List chat messages with coach isolation, speaker authorization, and syndicate group support."""
    query = select(ChatMessage)
    
    is_head_coach = (
        current_user.role == "coach" and (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
    )

    if client_id:
        if client_id.startswith("group-"):
            # Syndicate group chat
            g_res = await db.execute(select(ChatGroup).where(ChatGroup.id == client_id))
            group = g_res.scalar_one_or_none()
            if not group:
                raise HTTPException(status_code=404, detail="Group not found")
            c_res = await db.execute(select(Client.id).where(Client.email.ilike(current_user.email)))
            user_ids = {current_user.id, current_user.email.lower()} | set(c_res.scalars().all())
            g_members = set(group.member_ids or [])
            if not is_head_coach and group.created_by != current_user.id and g_members.isdisjoint(user_ids):
                raise HTTPException(status_code=403, detail="Access denied to this syndicate thread")
            query = query.where(ChatMessage.client_id == client_id)
        elif current_user.role == "coach":
            # Coach querying client or peer
            c_res = await db.execute(select(Client).where(Client.id == client_id))
            client = c_res.scalar_one_or_none()
            if not is_head_coach and client and client.coach_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: speaker messages belong to another coach"
                )
            query = query.where(ChatMessage.client_id == client_id)
        else:
            # Speaker querying
            query = query.where(ChatMessage.client_id == client_id)
    else:
        if is_head_coach:
            pass  # Head coach can oversee all messages
        elif current_user.role == "coach":
            g_res = await db.execute(select(ChatGroup))
            all_groups = g_res.scalars().all()
            my_group_ids = [g.id for g in all_groups if current_user.id in (g.member_ids or []) or g.created_by == current_user.id]
            query = query.where(
                or_(
                    ChatMessage.coach_id == current_user.id, 
                    ChatMessage.client_id.in_(my_group_ids),
                    ChatMessage.client_id.like(f"%{current_user.id}%")
                )
            )
        else:
            c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
            speaker_clients = c_res.scalars().all()
            speaker_ids = [c.id for c in speaker_clients]
            g_res = await db.execute(select(ChatGroup))
            all_groups = g_res.scalars().all()
            user_ids = {current_user.id, current_user.email.lower()} | set(speaker_ids)
            my_group_ids = [g.id for g in all_groups if not set(g.member_ids or []).isdisjoint(user_ids) or g.created_by == current_user.id]
            
            peer_conditions = [ChatMessage.client_id.like(f"%{current_user.id}%")]
            for sid in speaker_ids:
                peer_conditions.append(ChatMessage.client_id.like(f"%{sid}%"))

            query = query.where(
                or_(
                    ChatMessage.client_id.in_(speaker_ids), 
                    ChatMessage.client_id.in_(my_group_ids),
                    *peer_conditions
                )
            )
            
    result = await db.execute(query.order_by(ChatMessage.id.asc()))
    return result.scalars().all()


@router.post("", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    msg_in: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a new message with coach isolation, syndicate group routing, and sender attribution."""
    is_head_coach = (
        current_user.role == "coach" and (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
    )
    
    coach_id = current_user.id if current_user.role == "coach" else None
    
    if msg_in.client_id.startswith("group-"):
        # Syndicate group message
        g_res = await db.execute(select(ChatGroup).where(ChatGroup.id == msg_in.client_id))
        group = g_res.scalar_one_or_none()
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        c_res = await db.execute(select(Client.id).where(Client.email.ilike(current_user.email)))
        user_ids = {current_user.id, current_user.email.lower()} | set(c_res.scalars().all())
        g_members = set(group.member_ids or [])
        if not is_head_coach and group.created_by != current_user.id and g_members.isdisjoint(user_ids):
            raise HTTPException(status_code=403, detail="Access denied: you are not a member of this syndicate")
    elif msg_in.client_id.startswith("peer-") or msg_in.client_id.startswith("direct-"):
        # Peer conversation thread
        pass
    else:
        # Standard client thread
        c_res = await db.execute(select(Client).where(Client.id == msg_in.client_id))
        client = c_res.scalar_one_or_none()
        if current_user.role == "coach":
            if client and not is_head_coach and client.coach_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: cannot message speakers of another coach"
                )
            coach_id = current_user.id
        else:
            coach_id = client.coach_id if client else None
        
    now_str = datetime.now().strftime("%I:%M %p")
    if msg_in.client_msg_id and msg_in.client_msg_id.strip():
        c_exist = await db.execute(select(ChatMessage).where(ChatMessage.id == msg_in.client_msg_id.strip()))
        existing_msg = c_exist.scalar_one_or_none()
        if existing_msg:
            return existing_msg
        msg_id = msg_in.client_msg_id.strip()
    else:
        msg_id = f"msg-{int(time.time() * 1000)}"
    
    # Enrich attachment with sender attribution for groups and multi-party threads
    attachment_dict = dict(msg_in.attachment or {})
    if "senderName" not in attachment_dict:
        attachment_dict["senderName"] = current_user.full_name
    if "senderAvatar" not in attachment_dict:
        attachment_dict["senderAvatar"] = current_user.avatar or ""
    if "senderRole" not in attachment_dict:
        attachment_dict["senderRole"] = current_user.role
    if "senderId" not in attachment_dict:
        attachment_dict["senderId"] = current_user.id

    new_msg = ChatMessage(
        id=msg_id,
        coach_id=coach_id,
        client_id=msg_in.client_id,
        sender=msg_in.sender,
        text=msg_in.text,
        timestamp=now_str,
        is_read=False,
        attachment=attachment_dict
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
                target_client_id=None if (new_msg.client_id.startswith("group-") or new_msg.client_id.startswith("peer-")) else new_msg.client_id,
                target_coach_id=None if (new_msg.client_id.startswith("group-") or new_msg.client_id.startswith("peer-")) else coach_id
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
    # Find all unread messages in this thread
    res = await db.execute(
        select(ChatMessage).where(
            ChatMessage.client_id == body.client_id,
            ChatMessage.is_read == False
        )
    )
    unread_msgs = res.scalars().all()
    
    updated_any = False
    for msg in unread_msgs:
        att = msg.attachment or {}
        sender_id = att.get("senderId")
        # Do not mark own messages as read by self
        if sender_id and sender_id == current_user.id:
            continue
        if not sender_id:
            if current_user.role == "coach" and msg.sender == "coach":
                continue
            if current_user.role != "coach" and msg.sender == "client":
                continue
        msg.is_read = True
        updated_any = True
        
    if updated_any:
        await db.commit()

    is_group_or_peer = body.client_id.startswith("group-") or body.client_id.startswith("peer-")
    c_res = await db.execute(select(Client).where(Client.id == body.client_id))
    client = c_res.scalar_one_or_none()
    coach_id = client.coach_id if client else None

    target_c_id = None if is_group_or_peer else body.client_id
    target_co_id = None if is_group_or_peer else coach_id

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
                target_client_id=target_c_id,
                target_coach_id=target_co_id
            )
        )
    except Exception as e:
        logger.debug(f"Failed to broadcast messages_read: {e}")

    return {"status": "ok", "clientId": body.client_id}


@router.post("/typing")
async def broadcast_typing(
    body: TypingIndicatorRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Broadcast an ephemeral typing status over SSE to thread participants."""
    is_group_or_peer = body.client_id.startswith("group-") or body.client_id.startswith("peer-")
    c_res = await db.execute(select(Client).where(Client.id == body.client_id))
    client = c_res.scalar_one_or_none()
    coach_id = client.coach_id if client else None

    target_c_id = None if is_group_or_peer else body.client_id
    target_co_id = None if is_group_or_peer else (coach_id if current_user.role != "coach" else None)

    try:
        asyncio.create_task(
            sse_manager.broadcast(
                event="typing",
                data={
                    "clientId": body.client_id,
                    "userId": current_user.id,
                    "userName": current_user.full_name or ("Coach" if current_user.role == "coach" else "Speaker"),
                    "role": current_user.role,
                    "isTyping": body.is_typing
                },
                target_client_id=target_c_id,
                target_coach_id=target_co_id
            )
        )
    except Exception as e:
        logger.debug(f"Failed to broadcast typing event: {e}")

    return {"status": "ok", "clientId": body.client_id, "isTyping": body.is_typing}


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

