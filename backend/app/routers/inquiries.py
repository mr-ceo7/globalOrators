"""
Partnership & Institutional Inquiries Router
"""

import time
import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, status

from app.schemas.inquiry import InquiryCreate, InquiryResponse

logger = logging.getLogger("globalorators.inquiries")
router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

# In-memory storage for submitted inquiries
_inquiries_db: List[InquiryResponse] = []


@router.post("", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_inquiry(inquiry_in: InquiryCreate):
    """Submit a partnership, school, or grant inquiry."""
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    inquiry_id = f"GOP-INQ-{datetime.utcnow().strftime('%Y%m%d')}-{int(time.time() * 1000) % 10000:04d}"
    
    response_data = InquiryResponse(
        status="success",
        inquiry_id=inquiry_id,
        organization=inquiry_in.organization,
        email=inquiry_in.email,
        branch=inquiry_in.branch,
        focus=inquiry_in.focus,
        message=inquiry_in.message or "",
        created_at=timestamp_str
    )
    
    _inquiries_db.append(response_data)
    logger.info(f"New partnership inquiry received: {inquiry_id} from {inquiry_in.organization} ({inquiry_in.email})")
    
    return response_data


@router.get("", response_model=List[InquiryResponse])
async def list_inquiries():
    """List received inquiries (for admin review)."""
    return _inquiries_db
