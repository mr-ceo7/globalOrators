"""
Progress Photos Router
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.photo import ProgressPhoto
from app.models.client import Client
from app.models.user import User
from app.schemas.photo import ProgressPhotoCreate, ProgressPhotoResponse

router = APIRouter(prefix="/photos", tags=["Photos"])


@router.get("", response_model=List[ProgressPhotoResponse])
async def list_photos(
    client_id: Optional[str] = Query(None, alias="clientId"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List progress photos with coach isolation and speaker verification."""
    query = select(ProgressPhoto)

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
                    detail="Access denied: speaker photos belong to another coach"
                )
            query = query.where(ProgressPhoto.client_id == client_id)
        elif not is_default_coach:
            c_res = await db.execute(select(Client.id).where(Client.coach_id == current_user.id))
            coach_client_ids = c_res.scalars().all()
            query = query.where(ProgressPhoto.client_id.in_(coach_client_ids))
    else:
        # Speaker role: restrict to own client record(s)
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator progress media"
                )
            query = query.where(ProgressPhoto.client_id == client_id)
        else:
            query = query.where(ProgressPhoto.client_id.in_(speaker_ids))

    result = await db.execute(query.order_by(ProgressPhoto.date.desc()))
    return result.scalars().all()


@router.post("", response_model=ProgressPhotoResponse, status_code=status.HTTP_201_CREATED)
async def create_photo(
    photo_in: ProgressPhotoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a progress photo entry with ownership verification."""
    client_res = await db.execute(select(Client).where(Client.id == photo_in.client_id))
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
                detail="Access denied: cannot upload photos for another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to upload photos for other speakers"
            )

    p_id = photo_in.id or f"photo-{int(time.time() * 1000)}"
    p_dict = photo_in.model_dump(exclude_unset=True)
    p_dict["id"] = p_id
    
    new_photo = ProgressPhoto(**p_dict)
    db.add(new_photo)
    await db.commit()
    await db.refresh(new_photo)
    return new_photo


@router.delete("/{photo_id}")
async def delete_photo(
    photo_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete progress photo with ownership verification."""
    result = await db.execute(select(ProgressPhoto).where(ProgressPhoto.id == photo_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Photo not found")

    client_res = await db.execute(select(Client).where(Client.id == p.client_id))
    client = client_res.scalar_one_or_none()

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if not is_default_coach and client and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: cannot delete photos of another coach's speaker"
            )
    else:
        if client and client.email and client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to delete other speakers' photos"
            )
    
    await db.delete(p)
    await db.commit()
    return {"message": "Photo deleted", "id": photo_id}
