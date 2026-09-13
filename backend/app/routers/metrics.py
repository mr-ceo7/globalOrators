"""
Biometrics & Metrics Router
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.metric import MetricEntry
from app.models.client import Client
from app.models.activity import ActivityFeedItem
from app.models.user import User
from app.schemas.metric import MetricEntryCreate, MetricEntryResponse

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("", response_model=List[MetricEntryResponse])
async def list_metrics(
    client_id: Optional[str] = Query(None, alias="clientId"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List biometric metric entries with coach isolation and speaker verification."""
    query = select(MetricEntry)

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
                    detail="Access denied: speaker metrics belong to another coach"
                )
            query = query.where(MetricEntry.client_id == client_id)
        elif not is_default_coach:
            c_res = await db.execute(select(Client.id).where(Client.coach_id == current_user.id))
            coach_client_ids = c_res.scalars().all()
            query = query.where(MetricEntry.client_id.in_(coach_client_ids))
    else:
        # Speaker role: restrict to own client record(s)
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator biometric records"
                )
            query = query.where(MetricEntry.client_id == client_id)
        else:
            query = query.where(MetricEntry.client_id.in_(speaker_ids))
    
    result = await db.execute(query.order_by(MetricEntry.date.desc()))
    return result.scalars().all()


@router.post("", response_model=MetricEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_metric_entry(
    metric_in: MetricEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new biometric entry with coach and speaker authorization."""
    # Verify client ownership
    client_res = await db.execute(select(Client).where(Client.id == metric_in.client_id))
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
                detail="Access denied: cannot log metrics for another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to log metrics for other speakers"
            )

    m_id = metric_in.id or f"m-{int(time.time() * 1000)}"
    m_dict = metric_in.model_dump(exclude_unset=True)
    m_dict["id"] = m_id
    
    new_metric = MetricEntry(**m_dict)
    db.add(new_metric)
    
    # Update client profile
    client.current_weight_kg = metric_in.weight_kg
    if metric_in.body_fat_percentage:
        client.body_fat_percentage = metric_in.body_fat_percentage
        
    # Activity log
    activity = ActivityFeedItem(
        id=f"act-{int(time.time() * 1000)}",
        coach_id=client.coach_id,
        type="check_in_submitted",
        client_id=client.id,
        client_name=client.name,
        client_avatar=client.avatar,
        title="Biometrics Check-In",
        description=f"Logged weight: {metric_in.weight_kg} kg",
        timestamp="Just now",
        metadata_json={"weightKg": metric_in.weight_kg}
    )
    db.add(activity)
        
    await db.commit()
    await db.refresh(new_metric)
    return new_metric


@router.delete("/{metric_id}")
async def delete_metric_entry(
    metric_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete metric entry with ownership verification."""
    result = await db.execute(select(MetricEntry).where(MetricEntry.id == metric_id))
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Metric entry not found")

    client_res = await db.execute(select(Client).where(Client.id == m.client_id))
    client = client_res.scalar_one_or_none()

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if not is_default_coach and client and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: cannot delete metrics of another coach's speaker"
            )
    else:
        if client and client.email and client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to delete other speakers' metrics"
            )
    
    await db.delete(m)
    await db.commit()
    return {"message": "Metric entry deleted", "id": metric_id}
