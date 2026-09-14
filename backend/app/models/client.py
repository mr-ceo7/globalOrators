"""
Client ORM Model
"""

from typing import List, Dict, Any, Optional
from sqlalchemy import String, Integer, Float, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    coach_id: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    avatar: Mapped[str] = mapped_column(String(512), default="")
    email: Mapped[str] = mapped_column(String(255), index=True, default="")
    phone: Mapped[str] = mapped_column(String(64), default="")
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=None)
    gender: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, default=None)
    status: Mapped[str] = mapped_column(String(64), default="Active", index=True)
    goal: Mapped[str] = mapped_column(String(64), default="")
    experience_level: Mapped[str] = mapped_column(String(64), default="")
    start_date: Mapped[str] = mapped_column(String(32), default="")

    current_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    current_program_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    compliance_rate: Mapped[float] = mapped_column(Float, default=0.0)
    workouts_completed: Mapped[int] = mapped_column(Integer, default=0)
    total_workouts_assigned: Mapped[int] = mapped_column(Integer, default=0)
    last_active: Mapped[str] = mapped_column(String(64), default="Recently")

    starting_weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    current_weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    target_weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    height_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    body_fat_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    target_body_fat: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)

    injuries_and_health: Mapped[List[str]] = mapped_column(JSON, default=list)
    medical_alerts: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    custom_coach_notes: Mapped[List[str]] = mapped_column(JSON, default=list)
    onboarding_survey: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    referral_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    adjudicator_notes: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)

