"""
Chat Group ORM Model
"""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ChatGroup(Base):
    __tablename__ = "chat_groups"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(String(64), nullable=False)
    member_ids: Mapped[List[str]] = mapped_column(JSON, default=list)
    chamber_room_id: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
