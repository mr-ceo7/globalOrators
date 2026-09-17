"""
Partnership & Institutional Inquiries Router
"""

import time
import asyncio
import logging
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, require_coach
from app.models.inquiry import Inquiry
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryResponse
from app.rate_limiter import rate_limit
from app.services.email import send_inquiry_notification_email

logger = logging.getLogger("globalorators.inquiries")
router = APIRouter(prefix="/inquiries", tags=["Inquiries"])


@router.post(
    "", 
    response_model=InquiryResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(limit=10, window_seconds=60, key_prefix="inquiries"))]
)
async def submit_inquiry(
    inquiry_in: InquiryCreate,
    db: AsyncSession = Depends(get_db)
):
    """Submit a partnership, school, or grant inquiry (Public)."""
    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    inquiry_id = f"GOP-INQ-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{int(time.time() * 1000) % 10000:04d}"
    
    inquiry_record = Inquiry(
        id=inquiry_id,
        organization=inquiry_in.organization.strip(),
        email=inquiry_in.email.strip().lower(),
        branch=inquiry_in.branch,
        focus=inquiry_in.focus,
        message=inquiry_in.message.strip() if inquiry_in.message else "",
        created_at=timestamp_str
    )
    
    db.add(inquiry_record)
    await db.commit()
    await db.refresh(inquiry_record)
    
    logger.info(f"New partnership inquiry persisted: {inquiry_id} from {inquiry_record.organization} ({inquiry_record.email})")

    try:
        asyncio.create_task(
            send_inquiry_notification_email(
                coach_email=settings.DEFAULT_COACH_EMAIL,
                organization=inquiry_record.organization,
                contact_email=inquiry_record.email,
                branch=inquiry_record.branch,
                focus=inquiry_record.focus,
                message=inquiry_record.message or "No message provided."
            )
        )
    except Exception as notify_err:
        logger.error(f"Failed to dispatch inquiry notification: {notify_err}")
    
    return InquiryResponse(
        status="success",
        inquiry_id=inquiry_record.id,
        organization=inquiry_record.organization,
        email=inquiry_record.email,
        branch=inquiry_record.branch,
        focus=inquiry_record.focus,
        message=inquiry_record.message or "",
        created_at=inquiry_record.created_at
    )


@router.get("", response_model=List[InquiryResponse])
async def list_inquiries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """List received inquiries (Coach / Admin only)."""
    result = await db.execute(select(Inquiry).order_by(Inquiry.created_at.desc()))
    items = result.scalars().all()
    return [
        InquiryResponse(
            status="success",
            inquiry_id=item.id,
            organization=item.organization,
            email=item.email,
            branch=item.branch,
            focus=item.focus,
            message=item.message or "",
            created_at=item.created_at
        )
        for item in items
    ]
