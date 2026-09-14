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
from app.schemas.client import (
    ClientCreate, 
    ClientUpdate, 
    ClientResponse, 
    AddCoachNoteRequest,
    ReassignCoachRequest,
    AddAdjudicationNoteRequest
)
from app.rate_limiter import rate_limit

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("", response_model=List[ClientResponse])
async def list_clients(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    intake: Optional[str] = Query(None, description="'unassigned' for triage pool, 'assigned' for active coach rosters"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List clients with Strict Coach Isolation, unassigned intake pool, and speaker privacy."""
    query = select(Client)
    
    # Strict Coach Isolation & Intake Triage Pool
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if intake == "unassigned":
            # Any coach can view the unassigned triage pool to claim or review applicants
            query = query.where(Client.coach_id.is_(None))
        elif intake == "assigned":
            if is_default_coach:
                query = query.where(Client.coach_id.is_not(None))
            else:
                query = query.where(Client.coach_id == current_user.id)
        else:
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
    
    # Redact sensitive coach notes for non-coach callers without mutating ORM models
    output = []
    for c in clients:
        c_resp = ClientResponse.model_validate(c)
        if current_user.role != "coach":
            c_resp.custom_coach_notes = []
        output.append(c_resp)
    return output


@router.get(
    "/me",
    response_model=ClientResponse,
    dependencies=[Depends(rate_limit(limit=30, window_seconds=60, key_prefix="clients_me"))]
)
async def get_my_client_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve authenticated speaker's own client profile.
    Resolves strictly by the authenticated session email, eliminating unauthenticated enumeration.
    """
    result = await db.execute(
        select(Client).where(Client.email.ilike(current_user.email)).order_by(Client.id.desc())
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No orator profile found associated with this authenticated account"
        )

    resp = ClientResponse.model_validate(client)
    if current_user.role != "coach":
        resp.custom_coach_notes = []

    return resp


@router.get("/lookup", include_in_schema=False)
async def extinguished_speaker_lookup():
    """Explicitly extinguished legacy lookup route to prevent public enumeration."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="The speaker lookup endpoint has been removed. Authenticated speakers must resolve their profile via /api/clients/me."
    )


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

    resp = ClientResponse.model_validate(client)
    if current_user.role != "coach":
        resp.custom_coach_notes = []
        
    return resp


@router.post(
    "", 
    response_model=ClientResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(limit=15, window_seconds=60, key_prefix="clients_create"))]
)
async def create_client(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """
    Onboard a new speaker or update existing record during speaker self-onboarding.
    Public unauthenticated callers are strictly restricted from modifying coach assignments,
    coach notes, compliance rates, or account status of existing profiles.
    """
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
            for key, value in update_data.items():
                setattr(existing, key, value)
        else:
            # Unauthenticated public caller: Strictly whitelist safe onboarding survey fields only
            # Prevent privilege escalation and mutation of coach assignments or notes
            safe_allowed_keys = {
                "onboarding_survey", "goal", "branch", "mission_focus", 
                "experience_level", "current_weight_kg", "target_weight_kg", 
                "starting_weight_kg", "avatar"
            }
            submitted_data = client_in.model_dump(exclude_unset=True)
            for key, value in submitted_data.items():
                if key in safe_allowed_keys:
                    setattr(existing, key, value)

        existing.last_active = "Just now"
        await db.commit()
        await db.refresh(existing)
        
        # Redact coach notes for public response without mutating database model
        resp = ClientResponse.model_validate(existing)
        if not user or user.role != "coach":
            resp.custom_coach_notes = []
        return resp

    client_id = f"client-{int(time.time() * 1000)}"
    client_dict = client_in.model_dump()
    coach_ref = client_dict.pop("coach_ref", None)
    
    # Tag client with the creating coach's ID for strict coach isolation
    if user and user.role == "coach":
        client_dict["coach_id"] = user.id
    else:
        assigned_coach_id = None
        referral_audit_note = None
        if coach_ref and coach_ref.strip():
            clean_ref = coach_ref.strip()
            coach_match = await db.execute(
                select(User).where(
                    User.role == "coach",
                    or_(
                        User.id == clean_ref,
                        User.email.ilike(clean_ref),
                        User.full_name.ilike(f"%{clean_ref}%")
                    )
                )
            )
            matched_coach = coach_match.scalars().first()
            if matched_coach:
                assigned_coach_id = matched_coach.id
                client_dict["referral_code"] = matched_coach.id
                referral_audit_note = f"Onboarded via coach referral ({matched_coach.full_name}). Assigned to coach {matched_coach.id}."
            else:
                client_dict["referral_code"] = clean_ref
                referral_audit_note = f"Applicant entered referral code '{clean_ref}' (unmatched coach). Assigned to intake triage pool."
        
        client_dict["coach_id"] = assigned_coach_id
        client_dict["status"] = "Active"
        if not referral_audit_note:
            referral_audit_note = "Public intake applicant. Assigned to unassigned faculty triage pool."
        client_dict["custom_coach_notes"] = [referral_audit_note]

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


@router.post(
    "/onboard", 
    response_model=ClientResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(limit=15, window_seconds=60, key_prefix="clients_onboard"))]
)
async def onboard_speaker(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """Dedicated public endpoint for self-onboarding new speakers with scoped privileges."""
    return await create_client(client_in=client_in, db=db, user=user)


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


@router.patch("/{client_id}/reassign-coach", response_model=ClientResponse)
async def reassign_client_coach(
    client_id: str,
    req: ReassignCoachRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Reassign a speaker to another coach (Head Coach or currently assigned coach)."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    is_default_coach = (
        current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
        or current_user.id == "coach-1"
    )
    # Only head coach, unassigned intake claim, or currently assigned coach can reassign
    if not is_default_coach and client.coach_id and client.coach_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: only the assigned coach or Head Coach can reassign this speaker"
        )

    # Validate target coach exists
    target_coach_res = await db.execute(
        select(User).where(User.id == req.coach_id, User.role == "coach", User.is_active == True)
    )
    target_coach = target_coach_res.scalar_one_or_none()
    if not target_coach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target coach '{req.coach_id}' not found or inactive"
        )

    prev_coach_id = client.coach_id or "Unassigned Intake"
    client.coach_id = target_coach.id

    # Append audit trail note
    import datetime
    now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    audit_note = (
        f"[{now_str}] Reassigned from {prev_coach_id} to Coach {target_coach.full_name} ({target_coach.id}) "
        f"by Coach {current_user.full_name}. Reason: {req.reason or 'Direct administrative delegation'}"
    )
    notes = list(client.custom_coach_notes or [])
    notes.insert(0, audit_note)
    client.custom_coach_notes = notes

    # Activity feed entry
    activity = ActivityFeedItem(
        id=f"act-{int(time.time() * 1000)}",
        coach_id=target_coach.id,
        type="check_in_submitted",
        client_id=client.id,
        client_name=client.name,
        client_avatar=client.avatar,
        title="Speaker Reassigned",
        description=f"Speaker {client.name} reassigned to Coach {target_coach.full_name}",
        timestamp="Just now",
        metadata_json={"previous_coach": prev_coach_id, "new_coach": target_coach.id, "reason": req.reason}
    )
    db.add(activity)

    await db.commit()
    await db.refresh(client)
    return client


@router.post("/{client_id}/adjudication-notes", response_model=ClientResponse)
async def add_adjudication_note(
    client_id: str,
    req: AddAdjudicationNoteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Add a panel adjudication / evaluator note (Open to any accredited coach / panel judge)."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    import datetime
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    note_id = f"adj-{int(time.time() * 1000)}"

    note_entry = {
        "id": note_id,
        "coachId": current_user.id,
        "coachName": current_user.full_name,
        "coachAvatar": current_user.avatar or "",
        "timestamp": now_iso,
        "note": req.note.strip(),
        "rubricCategory": req.rubric_category or "General Adjudication",
        "rating": req.rating,
    }

    current_notes = list(client.adjudicator_notes or [])
    current_notes.insert(0, note_entry)
    client.adjudicator_notes = current_notes

    # Also log activity
    activity = ActivityFeedItem(
        id=f"act-{int(time.time() * 1000)}",
        coach_id=current_user.id,
        type="check_in_submitted",
        client_id=client.id,
        client_name=client.name,
        client_avatar=client.avatar,
        title="Panel Adjudication Feedback",
        description=f"Coach {current_user.full_name} left evaluation on {req.rubric_category or 'Performance'}",
        timestamp="Just now",
        metadata_json={"category": req.rubric_category, "rating": req.rating}
    )
    db.add(activity)

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

