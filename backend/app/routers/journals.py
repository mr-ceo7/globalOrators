"""
Journals Router - Catharsis Vault Reflection Persistence
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.journal import JournalEntry
from app.models.client import Client
from app.models.user import User
from app.schemas.journal import JournalCreate, JournalResponse

router = APIRouter(prefix="/journals", tags=["Journals"])


@router.get("", response_model=List[JournalResponse])
async def list_journal_entries(
    client_id: Optional[str] = Query(None, alias="clientId"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List authenticated journal entries with coach isolation and speaker ownership verification."""
    query = select(JournalEntry)

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
                    detail="Access denied: speaker journals belong to another coach"
                )
            query = query.where(JournalEntry.client_id == client_id)
        elif not is_default_coach:
            c_res = await db.execute(select(Client.id).where(Client.coach_id == current_user.id))
            coach_client_ids = c_res.scalars().all()
            query = query.where(JournalEntry.client_id.in_(coach_client_ids))
    else:
        # Speaker role: verify ownership against speaker's registered profile
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator journal reflections"
                )
            query = query.where(JournalEntry.client_id == client_id)
        else:
            query = query.where(JournalEntry.client_id.in_(speaker_ids))

    result = await db.execute(query.order_by(JournalEntry.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    req: JournalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a durable journal reflection entry with strict ownership verification."""
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
                detail="Access denied: cannot write journal entries for another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to create journals for other speakers"
            )

    entry_id = f"j-{uuid.uuid4().hex[:12]}"
    entry = JournalEntry(
        id=entry_id,
        client_id=req.client_id,
        date=req.date,
        text=req.text.strip(),
        feel_before=req.feel_before,
        feel_after=req.feel_after
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a journal entry with ownership verification."""
    res = await db.execute(select(JournalEntry).where(JournalEntry.id == entry_id))
    entry = res.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    c_res = await db.execute(select(Client).where(Client.id == entry.client_id))
    client = c_res.scalar_one_or_none()

    if current_user.role != "coach" and client and client.email.lower() != current_user.email.lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    await db.delete(entry)
    await db.commit()
    return {"message": "Journal entry deleted", "id": entry_id}
