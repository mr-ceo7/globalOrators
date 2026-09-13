"""
Scheduled Workouts & Logging Router
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.config import settings
from app.dependencies import get_db, get_current_user, require_coach
from app.models.workout import ScheduledWorkout
from app.models.client import Client
from app.models.activity import ActivityFeedItem
from app.models.user import User
from app.schemas.workout import (
    ScheduledWorkoutCreate,
    ScheduledWorkoutUpdate,
    ScheduledWorkoutResponse,
    CompleteWorkoutRequest
)

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.get("", response_model=List[ScheduledWorkoutResponse])
async def list_workouts(
    client_id: Optional[str] = Query(None, alias="clientId"),
    date: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List scheduled workouts with coach isolation and optional filtering."""
    query = select(ScheduledWorkout)
    
    # Coach isolation
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if is_default_coach:
            query = query.where(or_(ScheduledWorkout.coach_id == current_user.id, ScheduledWorkout.coach_id.is_(None)))
        else:
            query = query.where(ScheduledWorkout.coach_id == current_user.id)
    else:
        # Speaker isolation
        speaker_res = await db.execute(select(Client.id).where(Client.email.ilike(current_user.email)))
        speaker_ids = speaker_res.scalars().all()
        query = query.where(ScheduledWorkout.client_id.in_(speaker_ids))
        
    if client_id:
        query = query.where(ScheduledWorkout.client_id == client_id)
    if date:
        query = query.where(ScheduledWorkout.date == date)
    if status_filter:
        query = query.where(ScheduledWorkout.status == status_filter)
    
    result = await db.execute(query.order_by(ScheduledWorkout.date.desc()))
    return result.scalars().all()


@router.get("/{workout_id}", response_model=ScheduledWorkoutResponse)
async def get_workout(
    workout_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single workout details with coach isolation."""
    result = await db.execute(select(ScheduledWorkout).where(ScheduledWorkout.id == workout_id))
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if not is_default_coach and w.coach_id and w.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: session belongs to another coach"
            )
    else:
        client_res = await db.execute(select(Client).where(Client.id == w.client_id))
        client = client_res.scalar_one_or_none()
        if client and client.email and client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to other orator rehearsal sessions"
            )
            
    return w


@router.post("", response_model=ScheduledWorkoutResponse, status_code=status.HTTP_201_CREATED)
async def create_or_schedule_workout(
    workout_in: ScheduledWorkoutCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule a workout with coach isolation."""
    w_id = workout_in.id or f"sched-{int(time.time() * 1000)}"
    w_dict = workout_in.model_dump(exclude_unset=True)
    w_dict["id"] = w_id
    
    # Check client ownership
    client_res = await db.execute(select(Client).where(Client.id == workout_in.client_id))
    client = client_res.scalar_one_or_none()
    
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if client and not is_default_coach and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: speaker belongs to another coach"
            )
        w_dict["coach_id"] = current_user.id
    else:
        if client and client.email and client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to schedule rehearsals for other speakers"
            )
        if client and client.coach_id:
            w_dict["coach_id"] = client.coach_id
            
    new_w = ScheduledWorkout(**w_dict)
    db.add(new_w)
    await db.commit()
    await db.refresh(new_w)
    return new_w


@router.patch("/{workout_id}", response_model=ScheduledWorkoutResponse)
@router.put("/{workout_id}", response_model=ScheduledWorkoutResponse)
async def update_workout_log(
    workout_id: str,
    workout_in: ScheduledWorkoutUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update workout details or live log data with coach isolation."""
    result = await db.execute(select(ScheduledWorkout).where(ScheduledWorkout.id == workout_id))
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if not is_default_coach and w.coach_id and w.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: session belongs to another coach"
            )
    else:
        client_res = await db.execute(select(Client).where(Client.id == w.client_id))
        client = client_res.scalar_one_or_none()
        if client and client.email and client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    update_data = workout_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(w, field, val)
        
    await db.commit()
    await db.refresh(w)
    return w


@router.post("/{workout_id}/complete", response_model=ScheduledWorkoutResponse)
async def complete_workout(
    workout_id: str,
    req: CompleteWorkoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete a workout, update client statistics, and broadcast to coach-isolated activity feed."""
    result = await db.execute(select(ScheduledWorkout).where(ScheduledWorkout.id == workout_id))
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
            or current_user.id == "coach-1"
        )
        if not is_default_coach and w.coach_id and w.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: session belongs to another coach"
            )
    
    w.status = "Completed"
    w.duration_min = req.duration_min or w.duration_min or 55
    w.rating = req.rating or 5
    if req.client_feedback:
        w.client_feedback = req.client_feedback
    if req.coach_feedback:
        w.coach_feedback = req.coach_feedback
    if req.exercises:
        w.exercises = req.exercises
        
    # Update client stats
    client_res = await db.execute(select(Client).where(Client.id == w.client_id))
    client = client_res.scalar_one_or_none()
    if client:
        client.workouts_completed = (client.workouts_completed or 0) + 1
        client.last_active = "Just now"
        if client.total_workouts_assigned and client.total_workouts_assigned > 0:
            client.compliance_rate = round(min(100.0, (client.workouts_completed / client.total_workouts_assigned) * 100), 1)
            
    # Activity feed with coach isolation
    activity = ActivityFeedItem(
        id=f"act-{int(time.time() * 1000)}",
        coach_id=w.coach_id or (client.coach_id if client else None),
        type="workout_completed",
        client_id=w.client_id,
        client_name=w.client_name or (client.name if client else "Client"),
        client_avatar=w.client_avatar or (client.avatar if client else ""),
        title=f"Logged: {w.workout_title}",
        description=f"Completed {w.duration_min} min session with {w.rating}/5 rating",
        timestamp="Just now",
        metadata_json={"workout_id": w.id, "rating": w.rating}
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(w)
    return w


@router.delete("/{workout_id}")
async def delete_workout(
    workout_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Delete scheduled workout (Coach only, own sessions)."""
    result = await db.execute(select(ScheduledWorkout).where(ScheduledWorkout.id == workout_id))
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    is_default_coach = (
        current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower() 
        or current_user.id == "coach-1"
    )
    if not is_default_coach and w.coach_id and w.coach_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you can only delete your own rehearsal sessions"
        )
    
    await db.delete(w)
    await db.commit()
    return {"message": "Workout deleted successfully", "id": workout_id}
