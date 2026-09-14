"""
Coaches Directory Router
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db
from app.models.user import User
from app.schemas.client import CoachDirectoryItem

router = APIRouter(prefix="/coaches", tags=["Coaches"])


@router.get("", response_model=List[CoachDirectoryItem])
async def list_coaches(db: AsyncSession = Depends(get_db)):
    """List active faculty coaches for referral attribution, panel adjudication, and reassignment."""
    result = await db.execute(
        select(User).where(User.role == "coach", User.is_active == True).order_by(User.full_name.asc())
    )
    coaches = result.scalars().all()
    return [
        CoachDirectoryItem(
            id=c.id,
            name=c.full_name,
            email=c.email,
            avatar=c.avatar or "",
            role="coach"
        )
        for c in coaches
    ]
