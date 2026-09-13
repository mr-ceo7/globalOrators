"""
Clients Management Router
"""

import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, or_

from app.config import settings
from app.dependencies import get_db, get_current_user, get_optional_user, require_coach
from app.models.client import Client
from app.models.activity import ActivityFeedItem
from app.models.user import User
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse, AddCoachNoteRequest

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("", response_model=List[ClientResponse])
async def list_clients(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List clients with Strict Coach Isolation. Coaches only see their own roster (head coach also sees unassigned seed demo data)."""
    query = select(Client)
    
    # Strict Coach Isolation
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if is_default_coach:
            query = query.where(or_(Client.coach_id == current_user.id, Client.coach_id.is_(None)))
        else:
            query = query.where(Client.coach_id == current_user.id)
    else:
        # Speaker isolation
        query = query.where(Client.email.ilike(current_user.email))
    
    if status_filter:
        query = query.where(Client.status == status_filter)
    if search:
        search_pattern = f"%{search.lower()}%"
        phone_digits = "".join(c for c in search if c.isdigit())
        conditions = [
            Client.name.ilike(search_pattern),
            Client.email.ilike(search_pattern),
            Client.goal.ilike(search_pattern),
            Client.phone.ilike(search_pattern),
        ]
        if len(phone_digits) >= 6:
            conditions.append(Client.phone.ilike(f"%{phone_digits}%"))
        query = query.where(or_(*conditions))
    
    result = await db.execute(query)
    clients = result.scalars().all()
    
    # Redact sensitive coach notes for non-coach callers
    if current_user.role != "coach":
        for c in clients:
            c.custom_coach_notes = []
    return clients


@router.get("/lookup", response_model=ClientResponse)
async def lookup_client(
    search: str = Query(..., description="Email or phone of the speaker to lookup"),
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """Lookup a speaker profile by exact email or phone. Sensitive coach notes are redacted for non-coach callers."""
    search_term = search.strip()
    if not search_term or len(search_term) < 4:
        raise HTTPException(status_code=400, detail="Search query must be at least 4 characters")

    search_lower = search_term.lower()
    phone_digits = "".join(c for c in search_term if c.isdigit())

    conditions = [
        Client.email.ilike(search_lower),
        Client.name.ilike(search_lower)
    ]
    if len(phone_digits) >= 6:
        conditions.append(Client.phone.ilike(f"%{phone_digits}%"))

    result = await db.execute(
        select(Client).where(or_(*conditions)).order_by(Client.id.desc())
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Speaker profile not found")
    
    # Redact internal coach notes if requester is unauthenticated or not a coach
    if not user or user.role != "coach":
        client.custom_coach_notes = []
        
    return client


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve single client details. Enforces strict coach isolation and speaker privacy."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
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
                detail="Access denied: this speaker profile belongs to another coach"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied to other orator profiles"
            )
        client.custom_coach_notes = []
        
    return client


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """Create a new client or update existing client if email or phone matches."""
    # Check if a client with the same email or phone already exists
    existing = None
    if client_in.email and client_in.email.strip():
        res = await db.execute(select(Client).where(Client.email.ilike(client_in.email.strip())))
        existing = res.scalars().first()
    if not existing and client_in.phone and client_in.phone.strip():
        phone_digits = "".join(c for c in client_in.phone if c.isdigit())
        if len(phone_digits) >= 7:
            res = await db.execute(select(Client).where(Client.phone.ilike(f"%{phone_digits}%")))
            existing = res.scalars().first()

    if existing:
        if user and user.role == "coach":
            is_default_coach = (
                user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
                or user.id == "coach-1"
            )
            if not is_default_coach and existing.coach_id and existing.coach_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="A speaker with this email or phone is already enrolled with another coach"
                )
        update_data = client_in.model_dump(exclude_unset=True)
        # Protect coach notes from being overwritten by public unauthenticated callers
        if not user or user.role != "coach":
            update_data.pop("custom_coach_notes", None)
            update_data.pop("compliance_rate", None)
            
        for key, value in update_data.items():
            setattr(existing, key, value)
        existing.last_active = "Just now"
        await db.commit()
        await db.refresh(existing)
        return existing

    client_id = f"client-{int(time.time() * 1000)}"
    client_dict = client_in.model_dump()
    
    # Tag client with the creating coach's ID for strict coach isolation
    if user and user.role == "coach":
        client_dict["coach_id"] = user.id
    else:
        client_dict["coach_id"] = "coach-1" # Public registrations routed to default head coach

    if not user or user.role != "coach":
        client_dict["custom_coach_notes"] = []

    new_client = Client(
        id=client_id,
        workouts_completed=0,
        total_workouts_assigned=0,
        compliance_rate=100.0,
        last_active="Just registered",
        **client_dict
    )
    db.add(new_client)
    
    # Log activity feed
    activity = ActivityFeedItem(
        id=f"act-{int(time.time() * 1000)}",
        coach_id=new_client.coach_id,
        type="check_in_submitted",
        client_id=new_client.id,
        client_name=new_client.name,
        client_avatar=new_client.avatar,
        title="New Client Onboarded",
        description=f"Enrolled for {new_client.goal} coaching protocol",
        timestamp="Just now",
        metadata_json={"goal": new_client.goal, "weight": new_client.current_weight_kg}
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(new_client)
    return new_client


@router.patch("/{client_id}", response_model=ClientResponse)
@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_in: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update client information with coach ownership verification."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
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
                detail="Access denied: you can only update your own assigned speakers"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied to update other orator profiles"
            )
    
    update_data = client_in.model_dump(exclude_unset=True)
    if current_user.role != "coach":
        update_data.pop("custom_coach_notes", None)
        update_data.pop("compliance_rate", None)
        
    for field, val in update_data.items():
        setattr(client, field, val)
        
    await db.commit()
    await db.refresh(client)
    return client


@router.post("/{client_id}/notes", response_model=ClientResponse)
async def add_coach_note(
    client_id: str,
    note_req: AddCoachNoteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Add a coach note to client profile (Coach only, restricted to own clients)."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    is_default_coach = (
        current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
        or current_user.id == "coach-1"
    )
    if not is_default_coach and client.coach_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you can only add notes to your own assigned speakers"
        )

    notes = list(client.custom_coach_notes or [])
    notes.insert(0, note_req.note)
    client.custom_coach_notes = notes
    
    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/{client_id}")
async def delete_client(
    client_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Delete client (Coach only, restricted to own clients)."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    is_default_coach = (
        current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
        or current_user.id == "coach-1"
    )
    if not is_default_coach and client.coach_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you can only delete your own assigned speakers"
        )

    await db.delete(client)
    await db.commit()
    return {"message": "Client deleted successfully", "id": client_id}

