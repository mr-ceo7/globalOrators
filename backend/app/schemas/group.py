"""
Chat Group Pydantic Schemas
"""

from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ChatGroupCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    member_ids: List[str]


class ChatGroupResponse(BaseModel):
    id: str
    name: str
    description: str
    created_by: str
    member_ids: List[str]
    chamber_room_id: str
    created_at: datetime
    last_message: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
