"""
Audio Recording Model for Rehearsal Storage
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from app.database import Base


class AudioRecording(Base):
    __tablename__ = "audio_recordings"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("clients.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500), nullable=False)
    storage_key = Column(String(500), nullable=True)
    duration_seconds = Column(Integer, default=0)
    file_size_bytes = Column(Integer, default=0)
    mime_type = Column(String(50), default="audio/webm")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
