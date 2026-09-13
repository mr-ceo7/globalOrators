"""
Activity Feed Router
"""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.activity import ActivityFeedItem
from app.models.client import Client
from app.models.user import User
from app.schemas.activity import ActivityFeedItemResponse

router = APIRouter(prefix="/activity", tags=["Activity Feed"])


@router.get("", response_model=List[ActivityFeedItemResponse])
async def list_activity(
    limit: int = Query(25, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List activity feed items with strict coach isolation and speaker authorization."""
    query = select(ActivityFeedItem)
    
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if is_default_coach:
            query = query.where(or_(ActivityFeedItem.coach_id == current_user.id, ActivityFeedItem.coach_id.is_(None)))
        else:
            query = query.where(ActivityFeedItem.coach_id == current_user.id)
    else:
        speaker_res = await db.execute(select(Client.id).where(Client.email.ilike(current_user.email)))
        speaker_ids = speaker_res.scalars().all()
        query = query.where(ActivityFeedItem.client_id.in_(speaker_ids))
        
    result = await db.execute(query.order_by(ActivityFeedItem.id.desc()).limit(limit))
    return result.scalars().all()

