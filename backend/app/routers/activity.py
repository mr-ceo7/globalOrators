"""
Activity Feed Router
"""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models.activity import ActivityFeedItem
from app.models.user import User
from app.schemas.activity import ActivityFeedItemResponse

router = APIRouter(prefix="/activity", tags=["Activity Feed"])


@router.get("", response_model=List[ActivityFeedItemResponse])
async def list_activity(
    limit: int = Query(25, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List activity feed items."""
    query = select(ActivityFeedItem).order_by(ActivityFeedItem.id.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

