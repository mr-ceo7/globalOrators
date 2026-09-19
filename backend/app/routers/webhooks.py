"""
Resend Inbound Webhooks Router for Global Orators Platform
Handles incoming webhooks from Resend for inbound email reception,
cryptographic Svix signature verification, and automated forwarding.
"""

import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.config import settings
from app.dependencies import get_db, require_coach
from app.models.user import User
from app.models.inbound_email import InboundEmail
from app.services.inbound_forwarder import (
    verify_svix_signature,
    fetch_and_forward_inbound_email,
    sync_recent_inbound_emails
)

logger = logging.getLogger("globalorators.webhooks")
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


class InboundEmailResponse(BaseModel):
    id: str
    from_address: str
    to_address: str
    subject: str
    forwarded_to: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


@router.post("/resend", status_code=status.HTTP_200_OK)
async def handle_resend_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Public webhook receiver for Resend events.
    Verifies Svix signature, extracts inbound email IDs, and forwards
    the email to the configured administrator inbox.
    """
    raw_body = await request.body()
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    # Verify cryptographic signature if secret is active
    if settings.RESEND_WEBHOOK_SECRET and not settings.TESTING:
        is_valid = verify_svix_signature(
            secret=settings.RESEND_WEBHOOK_SECRET,
            msg_id=svix_id,
            timestamp=svix_timestamp,
            body_bytes=raw_body,
            signature_header=svix_signature
        )
        if not is_valid:
            logger.warning("[Resend Webhook] Rejected payload due to invalid signature.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cryptographic webhook signature."
            )

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as parse_err:
        logger.error("[Resend Webhook] Malformed JSON payload: %s", parse_err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed JSON body."
        )

    event_type = payload.get("type", "")
    logger.info("[Resend Webhook] Processing event type: %s", event_type)

    if event_type == "email.received":
        data = payload.get("data", {})
        email_id = data.get("email_id") or data.get("id")
        if not email_id:
            logger.warning("[Resend Webhook] email.received event missing email_id.")
            return {"status": "error", "message": "Missing email_id"}

        result = await fetch_and_forward_inbound_email(email_id=email_id, db=db)
        return {"status": "ok", "event": event_type, "result": result}

    # Gracefully acknowledge non-inbound events (e.g., email.delivered, email.bounced)
    return {"status": "acknowledged", "event": event_type}


@router.get("/resend/inbound-emails", response_model=List[InboundEmailResponse])
async def list_inbound_emails(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """List historical inbound emails and their forwarding status (Coach / Admin only)."""
    result = await db.execute(select(InboundEmail).order_by(InboundEmail.created_at.desc()).limit(100))
    records = result.scalars().all()
    return [
        InboundEmailResponse(
            id=rec.id,
            from_address=rec.from_address,
            to_address=rec.to_address,
            subject=rec.subject,
            forwarded_to=rec.forwarded_to,
            status=rec.status,
            created_at=rec.created_at
        )
        for rec in records
    ]


@router.post("/resend/sync")
async def trigger_inbound_sync(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_coach)
):
    """
    Manually trigger synchronization of recent received emails from Resend
    to ensure zero dropped correspondence (Coach / Admin only).
    """
    sync_result = await sync_recent_inbound_emails(db=db)
    return sync_result
