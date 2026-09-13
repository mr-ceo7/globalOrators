"""
Personal Records (PRs) Router
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.personal_record import PersonalRecord
from app.models.client import Client
from app.models.activity import ActivityFeedItem
from app.models.user import User
from app.schemas.personal_record import PersonalRecordCreate, PersonalRecordResponse

router = APIRouter(prefix="/prs", tags=["Personal Records"])


@router.get("", response_model=List[PersonalRecordResponse])
async def list_prs(
    client_id: Optional[str] = Query(None, alias="clientId"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List personal records with coach isolation and speaker verification."""
    query = select(PersonalRecord)

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if client_id:
            c_res = await db.execute(select(Client).where(Client.id == client_id))
            client = c_res.scalar_one_or_none()
            if not is_default_coach and client and client.coach_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: speaker PRs belong to another coach"
                )
            query = query.where(PersonalRecord.client_id == client_id)
        elif not is_default_coach:
            c_res = await db.execute(select(Client.id).where(Client.coach_id == current_user.id))
            coach_client_ids = c_res.scalars().all()
            query = query.where(PersonalRecord.client_id.in_(coach_client_ids))
    else:
        # Speaker role: restrict to own client record(s)
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator PR records"
                )
            query = query.where(PersonalRecord.client_id == client_id)
        else:
            query = query.where(PersonalRecord.client_id.in_(speaker_ids))

    result = await db.execute(query.order_by(PersonalRecord.date.desc()))
    return result.scalars().all()


@router.post("", response_model=PersonalRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_pr(
    pr_in: PersonalRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new personal record with ownership verification."""
    client_res = await db.execute(select(Client).where(Client.id == pr_in.client_id))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if not is_default_coach and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: cannot log PRs for another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to log PRs for other speakers"
            )

    pr_id = pr_in.id or f"pr-{int(time.time() * 1000)}"
    pr_dict = pr_in.model_dump(exclude_unset=True)
    pr_dict["id"] = pr_id
    
    new_pr = PersonalRecord(**pr_dict)
    db.add(new_pr)
    
    # Activity log
    client_res = await db.execute(select(Client).where(Client.id == pr_in.client_id))
    client = client_res.scalar_one_or_none()
    if client:
        activity = ActivityFeedItem(
            id=f"act-{int(time.time() * 1000)}",
            type="pr_achieved",
            client_id=client.id,
            client_name=client.name,
            client_avatar=client.avatar,
            title="New Personal Record! 🔥",
            description=f"{pr_in.exercise_name}: {pr_in.weight_kg}kg x {pr_in.reps} reps (1RM: {pr_in.estimated_1rm_kg}kg)",
            timestamp="Just now",
            metadata_json={"exerciseName": pr_in.exercise_name, "weightKg": pr_in.weight_kg}
        )
        db.add(activity)
        
    await db.commit()
    await db.refresh(new_pr)
    return new_pr
