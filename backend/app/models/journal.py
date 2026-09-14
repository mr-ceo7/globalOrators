"""
Journal Entry Model for Catharsis Vault Reflections
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from app.database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("clients.id"), nullable=False, index=True)
    date = Column(String(50), nullable=False)
    text = Column(Text, nullable=False)
    feel_before = Column(String(100), nullable=False)
    feel_after = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
