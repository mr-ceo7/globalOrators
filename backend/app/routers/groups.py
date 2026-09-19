"""
Chat Groups Router - WhatsApp-Style Orator Syndicates & Live Group Calls
"""

import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.group import ChatGroup
from app.models.message import ChatMessage
from app.models.client import Client
from app.models.user import User
from app.schemas.group import ChatGroupCreate, ChatGroupResponse
from app.services.events import sse_manager

logger = logging.getLogger("globalorators.groups")
router = APIRouter(prefix="/groups", tags=["Chat Groups"])


async def _get_user_identifiers(user: User, db: AsyncSession) -> List[str]:
    """Get all candidate IDs representing this user (user ID, client ID, email)."""
    ids = [user.id, user.email.lower()]
    c_res = await db.execute(select(Client.id).where(Client.email.ilike(user.email)))
    for cid in c_res.scalars().all():
        ids.append(cid)
    return ids


@router.get("", response_model=List[ChatGroupResponse])
async def list_groups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all orator syndicates/groups that the authenticated user belongs to."""
    is_head_coach = (
        current_user.role == "coach" and (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower()
            or current_user.id == "coach-1"
        )
    )
    
    result = await db.execute(select(ChatGroup).order_by(desc(ChatGroup.created_at)))
    all_groups = result.scalars().all()
    
    user_ids = set(await _get_user_identifiers(current_user, db))
    
    user_groups = []
    for g in all_groups:
        g_members = set(g.member_ids or [])
        # Head coach can oversee all groups; others see groups they are members of or created
        if is_head_coach or g.created_by == current_user.id or not g_members.isdisjoint(user_ids):
            # Fetch last message in group
            msg_res = await db.execute(
                select(ChatMessage)
                .where(ChatMessage.client_id == g.id)
                .order_by(desc(ChatMessage.id))
                .limit(1)
            )
            last_msg = msg_res.scalar_one_or_none()
            
            resp = ChatGroupResponse(
                id=g.id,
                name=g.name,
                description=g.description or "",
                created_by=g.created_by,
                member_ids=g.member_ids or [],
                chamber_room_id=g.chamber_room_id,
                created_at=g.created_at,
                last_message={
                    "text": last_msg.text,
                    "sender": last_msg.sender,
                    "timestamp": last_msg.timestamp,
                    "attachment": last_msg.attachment
                } if last_msg else None
            )
            user_groups.append(resp)
            
    return user_groups


@router.post("", response_model=ChatGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    req: ChatGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new WhatsApp-style orator syndicate / group."""
    name_clean = req.name.strip()
    if not name_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group name is required"
        )
        
    user_ids = await _get_user_identifiers(current_user, db)
    # Ensure current user is in members list
    member_ids = list(set(req.member_ids + user_ids))
    
    group_id = f"group-{uuid.uuid4().hex[:10]}"
    chamber_room_id = f"chamber-group-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    
    new_group = ChatGroup(
        id=group_id,
        name=name_clean,
        description=(req.description or "").strip(),
        created_by=current_user.id,
        member_ids=member_ids,
        chamber_room_id=chamber_room_id,
        created_at=now
    )
    db.add(new_group)
    
    # Post welcome message in group
    welcome_msg = ChatMessage(
        id=f"msg-{int(datetime.now().timestamp() * 1000)}",
        client_id=group_id,
        coach_id=current_user.id if current_user.role == "coach" else None,
        sender="coach" if current_user.role == "coach" else "client",
        text=f"🏛️ Group '{name_clean}' created by {current_user.full_name}. Welcome to the Syndicate.",
        timestamp=now.strftime("%I:%M %p"),
        is_read=True,
        attachment={
            "type": "system",
            "creatorName": current_user.full_name,
            "creatorAvatar": current_user.avatar
        }
    )
    db.add(welcome_msg)
    
    await db.commit()
    await db.refresh(new_group)
    
    resp = ChatGroupResponse(
        id=new_group.id,
        name=new_group.name,
        description=new_group.description,
        created_by=new_group.created_by,
        member_ids=new_group.member_ids,
        chamber_room_id=new_group.chamber_room_id,
        created_at=new_group.created_at,
        last_message={
            "text": welcome_msg.text,
            "sender": welcome_msg.sender,
            "timestamp": welcome_msg.timestamp
        }
    )
    
    # Broadcast SSE event
    try:
        asyncio.create_task(
            sse_manager.broadcast(
                event="group_created",
                data=resp.model_dump(mode="json")
            )
        )
    except Exception as e:
        logger.warning(f"SSE broadcast for group_created failed: {e}")
        
    return resp


@router.get("/{group_id}", response_model=ChatGroupResponse)
async def get_group(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve details of a single group."""
    res = await db.execute(select(ChatGroup).where(ChatGroup.id == group_id))
    group = res.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    user_ids = set(await _get_user_identifiers(current_user, db))
    g_members = set(group.member_ids or [])
    is_head_coach = (
        current_user.role == "coach" and (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower()
            or current_user.id == "coach-1"
        )
    )
    if not is_head_coach and group.created_by != current_user.id and g_members.isdisjoint(user_ids):
        raise HTTPException(status_code=403, detail="Access denied: you are not a member of this syndicate")
        
    return ChatGroupResponse.model_validate(group)


@router.post("/{group_id}/call")
async def start_group_call(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start a live group chamber call.
    Posts an interactive 'Join Group Chamber' call card into the group chat in real-time
    and returns the persistent chamber room ID for the caller to join.
    """
    res = await db.execute(select(ChatGroup).where(ChatGroup.id == group_id))
    group = res.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    now = datetime.now(timezone.utc)
    now_str = now.strftime("%I:%M %p")
    
    call_msg = ChatMessage(
        id=f"msg-{int(now.timestamp() * 1000)}",
        client_id=group.id,
        coach_id=current_user.id if current_user.role == "coach" else None,
        sender="coach" if current_user.role == "coach" else "client",
        text=f"📞 Live Group Chamber call initiated by {current_user.full_name}. Click to enter.",
        timestamp=now_str,
        is_read=False,
        attachment={
            "type": "group_call",
            "messageType": "group_call",
            "chamberRoomId": group.chamber_room_id,
            "groupName": group.name,
            "callerName": current_user.full_name,
            "callerAvatar": current_user.avatar,
            "callerRole": current_user.role,
            "startedAt": now.isoformat(),
            "status": "active"
        }
    )
    db.add(call_msg)
    await db.commit()
    await db.refresh(call_msg)
    
    # Broadcast call notification via SSE
    call_event_data = {
        "id": call_msg.id,
        "clientId": group.id,
        "sender": call_msg.sender,
        "text": call_msg.text,
        "timestamp": call_msg.timestamp,
        "attachment": call_msg.attachment,
        "chamberRoomId": group.chamber_room_id,
        "groupName": group.name,
        "callerName": current_user.full_name
    }
    
    try:
        asyncio.create_task(
            sse_manager.broadcast(event="new_message", data=call_event_data)
        )
        asyncio.create_task(
            sse_manager.broadcast(event="group_call_started", data=call_event_data)
        )
    except Exception as e:
        logger.warning(f"SSE broadcast for group call failed: {e}")
        
    return {
        "chamberRoomId": group.chamber_room_id,
        "groupName": group.name,
        "message": "Group chamber call active",
        "callMessageId": call_msg.id
    }
