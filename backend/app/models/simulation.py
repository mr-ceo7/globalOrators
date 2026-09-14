"""
Simulation Entry Model for Executive Speech Vault Simulations
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from app.database import Base


class SimulationEntry(Base):
    __tablename__ = "simulation_entries"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("clients.id"), nullable=False, index=True)
    date = Column(String(50), nullable=False)
    arena = Column(String(150), nullable=False)
    summary = Column(Text, nullable=False)
    wpm = Column(Integer, default=0)
    coach_status = Column(String(50), default="Submitted for Review")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
