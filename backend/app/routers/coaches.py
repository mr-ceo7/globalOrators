import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, require_coach
from app.models.user import User
from app.schemas.client import CoachDirectoryItem, CreateCoachRequest
from app.security import get_password_hash

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


@router.post("", response_model=CoachDirectoryItem, status_code=status.HTTP_201_CREATED)
async def create_coach(
    req: CreateCoachRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Allow master coach to provision a new coach account directly."""
    is_default_coach = (
        current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
        or current_user.id == "coach-1"
    )
    if not is_default_coach:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: only the Head Coach can provision faculty accounts"
        )

    email_clean = req.email.strip().lower()
    existing = await db.execute(select(User).where(User.email == email_clean))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A coach account with this email already exists"
        )

    new_coach = User(
        id=f"coach-{uuid.uuid4().hex[:8]}",
        email=email_clean,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name.strip(),
        role="coach",
        avatar=req.avatar or "",
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_coach)
    await db.commit()
    await db.refresh(new_coach)

    return CoachDirectoryItem(
        id=new_coach.id,
        name=new_coach.full_name,
        email=new_coach.email,
        avatar=new_coach.avatar or "",
        role="coach"
    )
