"""
Simulations Router - Executive Speech Vault Simulation Persistence
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.simulation import SimulationEntry
from app.models.client import Client
from app.models.user import User
from app.schemas.simulation import SimulationCreate, SimulationResponse

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.get("", response_model=List[SimulationResponse])
async def list_simulation_entries(
    client_id: Optional[str] = Query(None, alias="clientId"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List authenticated executive simulation records with coach isolation and speaker ownership verification."""
    query = select(SimulationEntry)

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
                    detail="Access denied: speaker simulations belong to another coach"
                )
            query = query.where(SimulationEntry.client_id == client_id)
        elif not is_default_coach:
            c_res = await db.execute(select(Client.id).where(Client.coach_id == current_user.id))
            coach_client_ids = c_res.scalars().all()
            query = query.where(SimulationEntry.client_id.in_(coach_client_ids))
    else:
        # Speaker role: verify ownership against speaker's registered profile
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator simulation records"
                )
            query = query.where(SimulationEntry.client_id == client_id)
        else:
            query = query.where(SimulationEntry.client_id.in_(speaker_ids))

    result = await db.execute(query.order_by(SimulationEntry.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation_entry(
    req: SimulationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a durable executive simulation entry with strict ownership verification."""
    c_res = await db.execute(select(Client).where(Client.id == req.client_id))
    client = c_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Speaker profile not found")

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower()
            or current_user.id == "coach-1"
        )
        if not is_default_coach and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: cannot create simulations for another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to create simulations for other speakers"
            )

    entry_id = f"exec-{uuid.uuid4().hex[:12]}"
    entry = SimulationEntry(
        id=entry_id,
        client_id=req.client_id,
        date=req.date,
        arena=req.arena,
        summary=req.summary.strip(),
        wpm=req.wpm or 0,
        coach_status=req.coach_status or "Submitted for Review"
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}")
async def delete_simulation_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a simulation entry with ownership verification."""
    res = await db.execute(select(SimulationEntry).where(SimulationEntry.id == entry_id))
    entry = res.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Simulation entry not found")

    c_res = await db.execute(select(Client).where(Client.id == entry.client_id))
    client = c_res.scalar_one_or_none()

    if current_user.role != "coach" and client and client.email.lower() != current_user.email.lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    await db.delete(entry)
    await db.commit()
    return {"message": "Simulation entry deleted", "id": entry_id}
