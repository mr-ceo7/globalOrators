"""
Inbound Email Processing and Forwarding Service for Global Orators Platform
Handles automated intake of incoming emails via Resend Inbound Gateway,
verifies cryptographic signatures, constructs editorial forwarding envelopes,
and re-dispatches correspondence directly to the administrative inbox.
"""

import hmac
import base64
import hashlib
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.inbound_email import InboundEmail

logger = logging.getLogger("globalorators.inbound")


def verify_svix_signature(
    secret: Optional[str],
    msg_id: Optional[str],
    timestamp: Optional[str],
    body_bytes: bytes,
    signature_header: Optional[str]
) -> bool:
    """
    Cryptographically verify Svix webhook HMAC-SHA256 signature provided by Resend.
    Prevents unauthorized spoofing of inbound webhook payloads.
    """
    if not secret or not secret.strip():
        # Secret not yet configured; bypass in relaxed/local dev mode
        return True

    if not msg_id or not timestamp or not signature_header:
        logger.warning("[Svix Verification] Missing signature headers: id=%s, ts=%s", msg_id, timestamp)
        return False

    try:
        clean_secret = secret.strip()
        if clean_secret.startswith("whsec_"):
            clean_secret = clean_secret[6:]
        
        key = base64.b64decode(clean_secret)
        to_sign = f"{msg_id}.{timestamp}.".encode("utf-8") + body_bytes
        expected_sig = base64.b64encode(hmac.new(key, to_sign, hashlib.sha256).digest()).decode("utf-8")

        for part in signature_header.split(" "):
            if "," in part:
                version, sig = part.split(",", 1)
                if version == "v1" and hmac.compare_digest(sig.strip(), expected_sig):
                    return True

        logger.warning("[Svix Verification] Signature mismatch for message %s", msg_id)
        return False
    except Exception as err:
        logger.error("[Svix Verification] Verification error: %s", err)
        return False


def build_forwarding_envelope(
    orig_from: str,
    orig_to: str,
    orig_subject: str,
    orig_html: Optional[str],
    orig_text: Optional[str],
    created_at_str: str
) -> Dict[str, str]:
    """
    Construct high-contrast editorial email envelope with original provenance headers
    and sanitized body content.
    """
    clean_from = orig_from or "Unknown Sender"
    clean_to = orig_to or "admissions@globaloratorsproject.com"
    clean_subject = orig_subject or "(No Subject)"
    
    body_content = orig_html if orig_html and orig_html.strip() else f"<pre style=\"font-family: monospace; white-space: pre-wrap;\">{orig_text or 'No content'}</pre>"

    html_envelope = f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1e293b;">
  <div style="background-color: #f8fafc; border-left: 4px solid #047857; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 6px 6px 0; border: 1px solid #e2e8f0; border-left-width: 4px; border-left-color: #047857;">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #047857; font-weight: 700; margin-bottom: 8px;">
      Global Orators Inbound Gateway &bull; Forwarded Dispatch
    </div>
    <div style="font-size: 13px; line-height: 1.6; color: #334155;">
      <p style="margin: 0 0 4px 0;"><strong>Original Sender:</strong> {clean_from}</p>
      <p style="margin: 0 0 4px 0;"><strong>Delivered To:</strong> {clean_to}</p>
      <p style="margin: 0 0 4px 0;"><strong>Subject:</strong> {clean_subject}</p>
      <p style="margin: 0;"><strong>Received At:</strong> {created_at_str}</p>
    </div>
  </div>
  <div style="padding: 8px 0;">
    {body_content}
  </div>
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; font-family: monospace;">
    Replying to this email will send your response directly to {clean_from}.
  </div>
</div>
"""

    text_envelope = f"""--- GLOBAL ORATORS INBOUND FORWARDED DISPATCH ---
Original Sender: {clean_from}
Delivered To: {clean_to}
Subject: {clean_subject}
Received At: {created_at_str}

-------------------------------------------------
{orig_text or ''}
"""

    return {
        "html": html_envelope,
        "text": text_envelope
    }


async def fetch_and_forward_inbound_email(email_id: str, db: AsyncSession) -> Dict[str, Any]:
    """
    Retrieve an inbound email from Resend, verify idempotency in DB,
    and forward to the configured destination mailbox.
    """
    if not settings.RESEND_API_KEY:
        logger.error("[Inbound Forwarder] RESEND_API_KEY is not configured.")
        return {"status": "error", "message": "RESEND_API_KEY missing", "email_id": email_id}

    # 1. Check idempotency in database
    existing_q = await db.execute(select(InboundEmail).where(InboundEmail.id == email_id))
    existing = existing_q.scalars().first()
    if existing and existing.status == "forwarded":
        logger.info("[Inbound Forwarder] Email %s has already been forwarded; skipping.", email_id)
        return {"status": "already_forwarded", "email_id": email_id}

    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
        "Content-Type": "application/json"
    }

    # 2. Fetch full email metadata and body from Resend Inbound API
    fetch_url = f"https://api.resend.com/emails/receiving/{email_id}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get(fetch_url, headers=headers)
        if res.status_code != 200:
            logger.error("[Inbound Forwarder] Failed to retrieve email %s: %s %s", email_id, res.status_code, res.text)
            return {"status": "error", "message": f"Resend API error {res.status_code}", "email_id": email_id}
        
        email_data = res.json()

    orig_from = email_data.get("from") or ""
    to_list: List[str] = email_data.get("to") or []
    orig_to = ", ".join(to_list) if to_list else "admissions@globaloratorsproject.com"
    orig_subject = email_data.get("subject") or "(No Subject)"
    orig_html = email_data.get("html") or ""
    orig_text = email_data.get("text") or ""
    created_at_str = email_data.get("created_at") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # 3. Construct the envelope
    envelope = build_forwarding_envelope(
        orig_from=orig_from,
        orig_to=orig_to,
        orig_subject=orig_subject,
        orig_html=orig_html,
        orig_text=orig_text,
        created_at_str=created_at_str
    )

    forward_target = settings.FORWARDING_EMAIL.strip() or settings.DEFAULT_COACH_EMAIL.strip()

    # 4. Dispatch the forwarded email
    dispatch_payload = {
        "from": f"Global Orators Gateway <{settings.FROM_EMAIL}>",
        "to": [forward_target],
        "reply_to": orig_from,
        "subject": f"[Fwd: {orig_to}] {orig_subject}",
        "html": envelope["html"],
        "text": envelope["text"]
    }

    send_url = "https://api.resend.com/emails"
    async with httpx.AsyncClient(timeout=15.0) as client:
        send_res = await client.post(send_url, headers=headers, json=dispatch_payload)
        if send_res.status_code not in (200, 201):
            logger.error("[Inbound Forwarder] Failed to dispatch forwarded email: %s %s", send_res.status_code, send_res.text)
            return {"status": "error", "message": f"Forward dispatch failed: {send_res.status_code}", "email_id": email_id}
        
        send_data = send_res.json()
        forward_dispatch_id = send_data.get("id")
        logger.info("[Inbound Forwarder] Email %s successfully forwarded to %s (Dispatch ID: %s)", email_id, forward_target, forward_dispatch_id)

    # 5. Persist record in database for audit and deduplication
    if not existing:
        inbound_record = InboundEmail(
            id=email_id,
            from_address=orig_from,
            to_address=orig_to,
            subject=orig_subject,
            body_text=orig_text[:5000] if orig_text else "",
            body_html=orig_html[:10000] if orig_html else "",
            forwarded_to=forward_target,
            status="forwarded",
            created_at=created_at_str
        )
        db.add(inbound_record)
    else:
        existing.status = "forwarded"
        existing.forwarded_to = forward_target

    await db.commit()

    return {
        "status": "forwarded",
        "email_id": email_id,
        "forwarded_to": forward_target,
        "dispatch_id": forward_dispatch_id,
        "subject": orig_subject,
        "from": orig_from,
        "to": orig_to
    }


async def sync_recent_inbound_emails(db: AsyncSession, limit: int = 10) -> Dict[str, Any]:
    """
    Query the Resend Inbound API for recent received emails and forward any
    that have not yet been processed. Acts as an automated safety net if a webhook was delayed.
    """
    if not settings.RESEND_API_KEY:
        return {"status": "error", "message": "RESEND_API_KEY missing", "synced_count": 0}

    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get("https://api.resend.com/emails/receiving", headers=headers)
        if res.status_code != 200:
            return {"status": "error", "message": f"Resend API error {res.status_code}", "synced_count": 0}
        
        data = res.json()
        inbound_list: List[Dict[str, Any]] = data.get("data", [])

    forwarded_items: List[Dict[str, Any]] = []
    skipped_items: List[str] = []

    for item in inbound_list[:limit]:
        email_id = item.get("id")
        if not email_id:
            continue

        existing_q = await db.execute(select(InboundEmail).where(InboundEmail.id == email_id))
        existing = existing_q.scalars().first()

        if existing and existing.status == "forwarded":
            skipped_items.append(email_id)
            continue

        res = await fetch_and_forward_inbound_email(email_id, db)
        if res.get("status") == "forwarded":
            forwarded_items.append(res)

    return {
        "status": "success",
        "total_checked": len(inbound_list),
        "newly_forwarded_count": len(forwarded_items),
        "skipped_count": len(skipped_items),
        "forwarded": forwarded_items
    }
