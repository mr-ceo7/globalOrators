"""
Simulation Pydantic Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SimulationCreate(BaseModel):
    client_id: str
    date: str
    arena: str
    summary: str
    wpm: Optional[int] = 0
    coach_status: Optional[str] = "Submitted for Review"


class SimulationResponse(BaseModel):
    id: str
    client_id: str
    date: str
    arena: str
    summary: str
    wpm: int
    coach_status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
