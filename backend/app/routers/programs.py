"""
Training Programs Router
"""

import time
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.config import settings
from app.dependencies import get_db, get_current_user, require_coach
from app.models.program import TrainingProgram
from app.models.client import Client
from app.models.workout import ScheduledWorkout
from app.models.activity import ActivityFeedItem
from app.models.user import User
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
    """List training programs (coaches see global templates and their own curriculums)."""
    query = select(TrainingProgram).where(
        or_(
            TrainingProgram.coach_id == current_user.id,
            TrainingProgram.coach_id.is_(None)
        )
    )
    if goal:
        query = query.where(TrainingProgram.goal == goal)
    if difficulty:
        query = query.where(TrainingProgram.difficulty == difficulty)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{program_id}", response_model=ProgramResponse)
async def get_program(
    program_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single program details."""
    result = await db.execute(select(TrainingProgram).where(TrainingProgram.id == program_id))
    prog = result.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")
        
    # Verify access: can only view if global template or owned by this coach/speaker
    if prog.coach_id and prog.coach_id != current_user.id:
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if not is_default_coach and current_user.role == "coach":
            raise HTTPException(status_code=403, detail="Access denied: this curriculum belongs to another coach")
            
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
