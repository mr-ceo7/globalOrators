"""
Institutional & Partnership Inquiries SQLAlchemy Model
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Text
from app.database import Base


class Inquiry(Base):
    """Stores partnership, educational institution, and speech booking inquiries."""
    __tablename__ = "inquiries"

    id = Column(String, primary_key=True, index=True)
    organization = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    branch = Column(String, nullable=False)
    focus = Column(String, nullable=False)
    message = Column(Text, default="")
    created_at = Column(
        String, 
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    )
