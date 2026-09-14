"""
Audio Recording Pydantic Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class RecordingResponse(BaseModel):
    id: str
    client_id: str
    title: str
    file_url: str
    duration_seconds: int
    file_size_bytes: int
    mime_type: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
