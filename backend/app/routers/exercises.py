"""
Exercise Library Router
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user, require_coach
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate, ExerciseResponse

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("", response_model=List[ExerciseResponse])
async def list_exercises(
    skill: Optional[str] = None,
    muscle: Optional[str] = None,
    format: Optional[str] = None,
    equipment: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all exercises with optional filtering by skill/muscle, format/equipment, difficulty, or search term."""
    query = select(Exercise)
    target_skill = skill or muscle
    target_format = format or equipment
    if target_skill:
        query = query.where(Exercise.primary_muscle == target_skill)
    if target_format:
        query = query.where(Exercise.equipment == target_format)
    if difficulty:
        query = query.where(Exercise.difficulty == difficulty)
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.where(Exercise.name.ilike(search_pattern))
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single exercise details."""
    result = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
    ex = result.scalar_one_or_none()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex


@router.post("", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_in: ExerciseCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Create a new custom exercise (Coach only)."""
    ex_id = f"ex-{int(time.time() * 1000)}"
    ex_dict = exercise_in.model_dump()
    ex_dict["is_custom"] = True
    new_ex = Exercise(id=ex_id, **ex_dict)
    db.add(new_ex)
    await db.commit()
    await db.refresh(new_ex)
    return new_ex


@router.patch("/{exercise_id}", response_model=ExerciseResponse)
@router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: str,
    exercise_in: ExerciseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Update exercise details (Coach only)."""
    result = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
    ex = result.scalar_one_or_none()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    update_data = exercise_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(ex, field, val)
        
    await db.commit()
    await db.refresh(ex)
    return ex


@router.delete("/{exercise_id}")
async def delete_exercise(
    exercise_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """Delete exercise (Coach only)."""
    result = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
    ex = result.scalar_one_or_none()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    await db.delete(ex)
    await db.commit()
    return {"message": "Exercise deleted successfully", "id": exercise_id}

