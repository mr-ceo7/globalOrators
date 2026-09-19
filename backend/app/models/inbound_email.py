"""
Inbound Email Log & Audit SQLAlchemy Model
Tracks all incoming emails received via Resend Inbound Gateway,
ensuring idempotency, audit trail, and automatic forward dispatch.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Text
from app.database import Base


class InboundEmail(Base):
    """Stores inbound correspondence received across all @globaloratorsproject.com aliases."""
    __tablename__ = "inbound_emails"

    id = Column(String, primary_key=True, index=True)  # Resend email_id
    from_address = Column(String, nullable=False, index=True)
    to_address = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=False)
    body_text = Column(Text, default="")
    body_html = Column(Text, default="")
    forwarded_to = Column(String, nullable=False)
    status = Column(String, default="forwarded")  # "forwarded", "received", "failed"
    created_at = Column(
        String, 
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    )
