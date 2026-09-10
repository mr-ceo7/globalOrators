"""
Inquiry Schema
"""

from typing import Optional
from app.schemas.common import CamelModel


class InquiryCreate(CamelModel):
    organization: str
    email: str
    branch: str = "Academy"
    focus: str
    message: Optional[str] = None


class InquiryResponse(CamelModel):
    status: str
    inquiry_id: str
    organization: str
    email: str
    branch: str
    focus: str
    message: str
    created_at: str
