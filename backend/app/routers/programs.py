"""
Training Programs Router
"""

import asyncio
import time
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.config import settings
from app.dependencies import get_db, get_current_user, require_coach
from app.models.program import TrainingProgram
from app.models.client import Client
from app.models.workout import ScheduledWorkout
from app.models.activity import ActivityFeedItem
from app.models.user import User
from app.models.exercise import Exercise
from app.rate_limiter import rate_limit
from app.services.ai import curriculum as ai_curriculum
from app.services.ai import files as ai_files
from app.schemas.program import (
    ProgramCreate,
    ProgramUpdate,
    ProgramResponse,
    AssignProgramRequest
)

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.get("", response_model=List[ProgramResponse])
async def list_programs(
    goal: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List training programs (coaches see global templates & own curriculums; speakers see global & enrolled)."""
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if is_default_coach:
            query = select(TrainingProgram)
        else:
            query = select(TrainingProgram).where(
                or_(
                    TrainingProgram.coach_id == current_user.id,
                    TrainingProgram.coach_id.is_(None)
                )
            )
    else:
        # Speaker: see global templates and enrolled/coach programs
        client_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        client = client_res.scalars().first()
        conditions = [TrainingProgram.coach_id.is_(None)]
        if client and client.current_program_id:
            conditions.append(TrainingProgram.id == client.current_program_id)
        if client and client.coach_id:
            conditions.append(TrainingProgram.coach_id == client.coach_id)
        query = select(TrainingProgram).where(or_(*conditions))

    if goal:
        query = query.where(TrainingProgram.goal == goal)
    if difficulty:
        query = query.where(TrainingProgram.difficulty == difficulty)
    
    result = await db.execute(query)
    return result.scalars().all()


MAX_IMPORT_FILES = 5


@router.post("/import", dependencies=[Depends(rate_limit(limit=5, window_seconds=60, key_prefix="curriculum_import"))])
async def import_curriculum_from_files(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach),
):
    """Read uploaded documents with AI and return a draft curriculum for the builder. Nothing is saved here."""
    if not ai_curriculum.ready():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI curriculum import is not configured on this server")
    if not files:
        raise HTTPException(status_code=400, detail="Upload at least one file")
    if len(files) > MAX_IMPORT_FILES:
        raise HTTPException(status_code=400, detail=f"Upload at most {MAX_IMPORT_FILES} files at a time")

    session = ai_curriculum.session_id(current_user.id)
    started = time.monotonic()
    uploads = []
    for f in files:
        name = (f.filename or "file")[:200]
        data = await f.read(ai_files.MAX_BYTES + 1)
        if len(data) > ai_files.MAX_BYTES:
            raise HTTPException(status_code=413, detail=f"{name} is larger than 10MB")
        if not data:
            raise HTTPException(status_code=400, detail=f"{name} is empty")
        if ai_files.kind(name, f.content_type or "") == "other":
            raise HTTPException(status_code=422, detail=f"{name}: that file type isn't supported. Use PDF, Word (.docx), PowerPoint (.pptx), text, Markdown or an image.")
        uploads.append((name, f.content_type or "", data))

    # Files are read side by side, within a shared time budget
    read_deadline = started + ai_curriculum.READ_SECONDS
    results = await asyncio.gather(
        *(ai_files.read(name, mime, data, session, read_deadline) for name, mime, data in uploads), return_exceptions=True)
    documents, sources = [], []
    for (name, _, _), result in zip(uploads, results):
        if isinstance(result, ValueError):
            raise HTTPException(status_code=422, detail=str(result))
        if isinstance(result, BaseException):
            raise HTTPException(status_code=422, detail=f"{name}: couldn't read the file. Try again in a minute, or upload it as Word or text.")
        text, read_by = result
        if not text.strip():
            raise HTTPException(status_code=422, detail=f"{name}: no text could be found in the file")
        documents.append((name, text))
        sources.append({"name": name, "readBy": read_by, "characters": len(text)})

    library = ai_curriculum.library_entries((await db.execute(select(Exercise))).scalars().all())
    try:
        raw, built_by = await ai_curriculum.build(documents, library, session, started + ai_curriculum.TOTAL_SECONDS)
    except ai_curriculum.TooLong:
        raise HTTPException(status_code=422, detail="The document is too long to turn into one draft. Split it into parts (for example a few weeks per file) and import them one at a time.")
    except RuntimeError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="The AI is busy right now. Try again in a minute.")
    try:
        draft = ai_curriculum.normalize(raw, library)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return {**draft, "sources": sources, "builtBy": built_by}


@router.get("/{program_id}", response_model=ProgramResponse)
async def get_program(
    program_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single program details with coach isolation and enrolled speaker access."""
    result = await db.execute(select(TrainingProgram).where(TrainingProgram.id == program_id))
    prog = result.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")
        
    # Verify access
    if prog.coach_id:
        if current_user.role == "coach":
            is_default_coach = (
                current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
                or current_user.id == "coach-1"
            )
            if not is_default_coach and prog.coach_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied: this curriculum belongs to another coach")
        else:
            # Speaker
            client_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
            client = client_res.scalars().first()
            is_enrolled = client and (client.current_program_id == prog.id or client.coach_id == prog.coach_id)
            if not is_enrolled:
                raise HTTPException(status_code=403, detail="Access denied: speaker is not enrolled in this curriculum")
            
    return prog


@router.post("", response_model=ProgramResponse, status_code=status.HTTP_201_CREATED)
async def save_or_create_program(
    program_in: ProgramCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Create or update a training program (Coach only, scoped to own workspace)."""
    now_str = date.today().isoformat()
    prog_id = program_in.id or f"prog-{int(time.time() * 1000)}"
    
    # Check if program exists
    result = await db.execute(select(TrainingProgram).where(TrainingProgram.id == prog_id))
    existing = result.scalar_one_or_none()
    
    if existing:
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if existing.coach_id and existing.coach_id != current_user.id and not is_default_coach:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you cannot modify another coach's curriculum"
            )
            
        update_dict = program_in.model_dump(exclude_unset=True)
        update_dict["updated_at"] = now_str
        for k, v in update_dict.items():
            setattr(existing, k, v)
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_prog = TrainingProgram(
            id=prog_id,
            coach_id=current_user.id,
            title=program_in.title,
            subtitle=program_in.subtitle,
            description=program_in.description,
            difficulty=program_in.difficulty,
            goal=program_in.goal,
            duration_weeks=program_in.duration_weeks,
            days_per_week=program_in.days_per_week,
            days=program_in.days,
            tags=program_in.tags,
            assigned_client_count=program_in.assigned_client_count,
            created_at=program_in.created_at or now_str,
            updated_at=now_str
        )
        db.add(new_prog)
        await db.commit()
        await db.refresh(new_prog)
        return new_prog


@router.patch("/{program_id}", response_model=ProgramResponse)
@router.put("/{program_id}", response_model=ProgramResponse)
async def update_program(
    program_id: str,
    program_in: ProgramUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Update program details (Coach only, scoped to own workspace)."""
    result = await db.execute(select(TrainingProgram).where(TrainingProgram.id == program_id))
    prog = result.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")
        
    is_default_coach = (
        current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
        or current_user.id == "coach-1"
    )
    if prog.coach_id and prog.coach_id != current_user.id and not is_default_coach:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you cannot modify another coach's curriculum"
        )
    
    update_data = program_in.model_dump(exclude_unset=True)
    update_data["updated_at"] = date.today().isoformat()
    for field, val in update_data.items():
        setattr(prog, field, val)
        
    await db.commit()
    await db.refresh(prog)
    return prog


@router.post("/{program_id}/assign")
async def assign_program(
    program_id: str,
    req: AssignProgramRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Assign training program to a client and auto-schedule upcoming workouts (Coach only)."""
    prog_res = await db.execute(select(TrainingProgram).where(TrainingProgram.id == program_id))
    program = prog_res.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    client_res = await db.execute(select(Client).where(Client.id == req.client_id))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    # Verify client ownership
    is_default_coach = (
        current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
        or current_user.id == "coach-1"
    )
    if not is_default_coach and client.coach_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you can only assign curriculums to your own speakers"
        )
        
    # Update client
    client.current_program_id = program.id
    client.current_program_name = program.title
    
    # Update program assigned count
    program.assigned_client_count = (program.assigned_client_count or 0) + 1
    
    # Auto-schedule workouts
    today = date.today()
    scheduled_workouts: List[ScheduledWorkout] = []
    
    for idx, day in enumerate(program.days or []):
        workout_date = today + timedelta(days=idx * 2)
        sched_id = f"sched-{int(time.time() * 1000)}-{idx}"
        
        sw = ScheduledWorkout(
            id=sched_id,
            client_id=client.id,
            client_name=client.name,
            client_avatar=client.avatar,
            program_id=program.id,
            program_name=program.title,
            workout_day_id=day.get("id", f"day-{idx+1}"),
            workout_title=day.get("name", f"Day {idx+1} Workout"),
            date=workout_date.isoformat(),
            time="09:00 AM",
            status="Scheduled",
            exercises=day.get("exercises", [])
        )
        db.add(sw)
        scheduled_workouts.append(sw)
        
    # Activity feed
    activity = ActivityFeedItem(
        id=f"act-{int(time.time() * 1000)}",
        type="check_in_submitted",
        client_id=client.id,
        client_name=client.name,
        client_avatar=client.avatar,
        title=f"Assigned: {program.title}",
        description=f"Program assigned with {len(program.days or [])} training days",
        timestamp="Just now",
        metadata_json={"program_id": program.id}
    )
    db.add(activity)
    
    await db.commit()
    return {
        "message": f"Assigned '{program.title}' to {client.name}",
        "client_id": client.id,
        "program_id": program.id,
        "scheduled_count": len(scheduled_workouts)
    }


@router.delete("/{program_id}")
async def delete_program(
    program_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Delete training program (Coach only)."""
    result = await db.execute(select(TrainingProgram).where(TrainingProgram.id == program_id))
    prog = result.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")
    
    await db.delete(prog)
    await db.commit()
    return {"message": "Program deleted successfully", "id": program_id}
