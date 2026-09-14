"""
Journal Pydantic Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class JournalCreate(BaseModel):
    client_id: str
    date: str
    text: str
    feel_before: str
    feel_after: str


class JournalResponse(BaseModel):
    id: str
    client_id: str
    date: str
    text: str
    feel_before: str
    feel_after: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
