"""
Habit Logs Router
"""

import time
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.habit import ClientDailyHabitLog
from app.models.client import Client
from app.models.user import User
from app.schemas.habit import (
    ClientDailyHabitLogCreate,
    ClientDailyHabitLogResponse,
    ToggleHabitRequest
)

router = APIRouter(prefix="/habits", tags=["Habits"])


@router.get("", response_model=List[ClientDailyHabitLogResponse])
async def list_habit_logs(
    client_id: Optional[str] = Query(None, alias="clientId"),
    date_val: Optional[str] = Query(None, alias="date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List habit logs with coach isolation and speaker ownership verification."""
    query = select(ClientDailyHabitLog)

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
                    detail="Access denied: speaker habits belong to another coach"
                )
            query = query.where(ClientDailyHabitLog.client_id == client_id)
        elif not is_default_coach:
            c_res = await db.execute(select(Client.id).where(Client.coach_id == current_user.id))
            coach_client_ids = c_res.scalars().all()
            query = query.where(ClientDailyHabitLog.client_id.in_(coach_client_ids))
    else:
        # Speaker role: verify ownership against speaker's registered profile
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator habit records"
                )
            query = query.where(ClientDailyHabitLog.client_id == client_id)
        else:
            query = query.where(ClientDailyHabitLog.client_id.in_(speaker_ids))

    if date_val:
        query = query.where(ClientDailyHabitLog.date == date_val)
    
    result = await db.execute(query.order_by(ClientDailyHabitLog.date.desc()))
    return result.scalars().all()


@router.post("", response_model=ClientDailyHabitLogResponse, status_code=status.HTTP_201_CREATED)
async def create_habit_log(
    log_in: ClientDailyHabitLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or save a daily habit log with ownership verification."""
    c_res = await db.execute(select(Client).where(Client.id == log_in.client_id))
    client = c_res.scalar_one_or_none()
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
                detail="Access denied: cannot modify habits of another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to create habits for other speakers"
            )

    log_id = log_in.id or f"habit-{int(time.time() * 1000)}"
    log_dict = log_in.model_dump(exclude_unset=True)
    log_dict["id"] = log_id
    
    new_log = ClientDailyHabitLog(**log_dict)
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log


@router.post("/toggle", response_model=ClientDailyHabitLogResponse)
async def toggle_habit(
    req: ToggleHabitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle completion status of a specific habit with ownership verification."""
    c_res = await db.execute(select(Client).where(Client.id == req.client_id))
    client = c_res.scalar_one_or_none()
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
                detail="Access denied: cannot toggle habits of another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to toggle habits for other speakers"
            )

    result = await db.execute(
        select(ClientDailyHabitLog).where(
            (ClientDailyHabitLog.client_id == req.client_id) & 
            (ClientDailyHabitLog.date == req.date)
        )
    )
    log = result.scalar_one_or_none()
    
    if not log:
        # Start today's log from the speaker's assigned rituals: the onboarding selection,
        # or else the rituals on their most recent earlier log (with completion reset).
        survey = client.onboarding_survey or {}
        selected_habits = survey.get("selectedHabits") or survey.get("selected_habits") or []
        if selected_habits:
            new_habits = [
                {
                    "habitId": f"h-{i+1}",
                    "title": h_title,
                    "completed": (req.habit_id == f"h-{i+1}"),
                    "targetValue": "1",
                    "unit": "daily"
                }
                for i, h_title in enumerate(selected_habits)
            ]
        else:
            prev_res = await db.execute(
                select(ClientDailyHabitLog)
                .where((ClientDailyHabitLog.client_id == req.client_id) & (ClientDailyHabitLog.date < req.date))
                .order_by(ClientDailyHabitLog.date.desc())
                .limit(1)
            )
            previous = prev_res.scalar_one_or_none()
            new_habits = [
                {**h, "completed": (h.get("habitId") == req.habit_id), "currentValue": 0}
                for h in (previous.habits if previous else []) or []
            ]
        if not new_habits:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No assigned orator habits found for this speaker profile"
            )

        if not any(h["habitId"] == req.habit_id for h in new_habits):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{req.habit_id}' not found in orator's assigned rituals"
            )

        log_id = f"habit-{int(time.time() * 1000)}"
        log = ClientDailyHabitLog(
            id=log_id,
            client_id=req.client_id,
            date=req.date,
            habits=new_habits
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
    else:
        # Update existing habit strictly by stable habitId
        habits = list(log.habits or [])
        found = False
        for h in habits:
            if h.get("habitId") == req.habit_id:
                h["completed"] = not h.get("completed", False)
                found = True
                break
        if not found:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Habit with ID '{req.habit_id}' not found in orator's assigned rituals"
            )
        log.habits = habits
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(log, "habits")
        await db.commit()
        await db.refresh(log)
    return log
