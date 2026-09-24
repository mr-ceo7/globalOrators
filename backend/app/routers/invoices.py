"""
Invoices Router

Head-coach-only proxy to the shared payment backend's invoice admin API. The Global Orators
company key (INVOICE_ADMIN_KEY) stays on this server; the payment backend scopes every call
to the "gop" company. Public invoice views and payments go to the payment backend directly.
"""

import json
import logging
from datetime import date
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel, Field

from app.config import settings
from app.dependencies import require_head_coach
from app.models.user import User
from app.rate_limiter import rate_limit

logger = logging.getLogger("globalorators.invoices")
router = APIRouter(prefix="/invoices", tags=["Invoices"])

GEMINI_MODEL = "gemini-2.5-flash"
# Invoice ids are forwarded into the payment backend's URL, so only plain ids are accepted.
INVOICE_ID_PATTERN = r"^[A-Za-z0-9_-]{1,100}$"


class InvoiceItem(BaseModel):
    description: str = ""
    quantity: float
    unitPrice: float


class InvoiceWrite(BaseModel):
    clientName: Optional[str] = None
    clientEmail: Optional[str] = None
    clientPhone: Optional[str] = None
    items: Optional[List[InvoiceItem]] = None
    tax: Optional[float] = None
    dueDate: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class InvoiceStatusUpdate(BaseModel):
    status: str


class DraftRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)


async def _forward(method: str, path: str, *, params: Optional[Dict[str, Any]] = None, body: Optional[Dict[str, Any]] = None) -> Any:
    if not settings.INVOICE_ADMIN_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Invoicing is not configured on this server")
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.request(
                method,
                f"{settings.PAYMENT_BACKEND_URL.rstrip('/')}{path}",
                params=params,
                json=body,
                headers={"X-Invoice-Admin-Key": settings.INVOICE_ADMIN_KEY},
            )
    except httpx.HTTPError as exc:
        logger.error(f"Payment backend unreachable: {exc}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The payment service is unreachable. Try again shortly.")

    try:
        payload = res.json()
    except ValueError:
        payload = None
    if res.status_code >= 400:
        message = (payload or {}).get("error") if isinstance(payload, dict) else None
        if res.status_code in (401, 503):
            logger.error(f"Payment backend refused the invoice admin key ({res.status_code})")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Invoicing is misconfigured: the payment service rejected this server's key.")
        raise HTTPException(status_code=res.status_code, detail=message or "Invoice request failed")
    return payload


@router.get("")
async def list_invoices(
    status_filter: Optional[str] = Query(None, alias="status"),
    _: User = Depends(require_head_coach),
):
    params = {"status": status_filter} if status_filter else None
    return await _forward("GET", "/api/invoices", params=params)


@router.post("")
async def create_invoice(req: InvoiceWrite, _: User = Depends(require_head_coach)):
    return await _forward("POST", "/api/invoices", body=req.model_dump(exclude_none=True))


@router.post("/draft", dependencies=[Depends(rate_limit(limit=10, window_seconds=60, key_prefix="invoice_draft"))])
async def draft_invoice(req: DraftRequest, _: User = Depends(require_head_coach)):
    """Turn a natural-language description into invoice fields with Gemini (server-side key)."""
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI drafting is not configured on this server")
    prompt = (
        "You are an assistant for Global Orators Project that extracts invoice data from natural language into clean JSON.\n"
        "Fields: clientName, clientEmail, clientPhone, items (array of { description: string, quantity: number, unitPrice: number }), "
        "tax (number), dueDate (YYYY-MM-DD), notes (string).\n"
        f"Today's date is: {date.today().isoformat()}.\n"
        f"Input text: {json.dumps(req.prompt)}\n\n"
        "Return ONLY valid JSON matching the schema without markdown tags."
    )
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
                headers={"x-goog-api-key": settings.GEMINI_API_KEY},
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
        data = res.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        text = text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)
        if not isinstance(parsed, dict):
            raise ValueError("Model did not return an object")
    except Exception as exc:
        logger.warning(f"Invoice drafting failed: {exc}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Could not draft an invoice from that description. Please specify the details more clearly.")

    allowed = {"clientName", "clientEmail", "clientPhone", "items", "tax", "dueDate", "notes"}
    return {k: v for k, v in parsed.items() if k in allowed}


@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str = Path(..., pattern=INVOICE_ID_PATTERN),
):
    return await _forward("GET", f"/api/invoices/{invoice_id}")


@router.put("/{invoice_id}")
async def update_invoice(
    req: InvoiceWrite,
    invoice_id: str = Path(..., pattern=INVOICE_ID_PATTERN),
    _: User = Depends(require_head_coach),
):
    return await _forward("PUT", f"/api/invoices/{invoice_id}", body=req.model_dump(exclude_none=True))


@router.patch("/{invoice_id}")
async def update_invoice_status(
    req: InvoiceStatusUpdate,
    invoice_id: str = Path(..., pattern=INVOICE_ID_PATTERN),
    _: User = Depends(require_head_coach),
):
    return await _forward("PATCH", f"/api/invoices/{invoice_id}", body=req.model_dump())


@router.post("/{invoice_id}/pay")
async def pay_invoice(
    invoice_id: str = Path(..., pattern=INVOICE_ID_PATTERN),
    body: Optional[Dict[str, Any]] = None,
):
    return await _forward("POST", f"/api/invoices/{invoice_id}/pay", body=body)


@router.post("/{invoice_id}/send-receipt")
async def send_invoice_receipt(
    invoice_id: str = Path(..., pattern=INVOICE_ID_PATTERN),
    body: Optional[Dict[str, Any]] = None,
):
    """
    Dispatch official invoice receipt email directly from Global Orators Project
    using GOP's authenticated email service (Resend / SMTP).
    """
    invoice = await _forward("GET", f"/api/invoices/{invoice_id}")
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice record not found")

    target_email = ((body or {}).get("email") or invoice.get("clientEmail") or "").strip()
    if not target_email or "@" not in target_email:
        raise HTTPException(status_code=400, detail="Valid recipient email address is required")

    invoice_number = invoice.get("invoiceNumber", "GOP-INVOICE")
    currency = invoice.get("currency", "KES")
    total = invoice.get("total", 0)
    items = invoice.get("items") or [{"description": "Pan-African Forensics & Oratory Services", "quantity": 1, "unitPrice": total}]
    settled_date = invoice.get("paidAt") or "Settled Online"
    txn_id = invoice.get("transactionId") or "ONLINE-SETTLEMENT"

    items_html = "".join([
        f'<tr style="border-bottom: 1px solid #1e293b;">'
        f'<td style="padding: 12px 16px; color: #f1f5f9; font-size: 13px;">{it.get("description", "Item")}</td>'
        f'<td style="padding: 12px 16px; color: #94a3b8; font-size: 13px; text-align: center; font-family: monospace;">{it.get("quantity", 1)}</td>'
        f'<td style="padding: 12px 16px; color: #94a3b8; font-size: 13px; text-align: right; font-family: monospace;">{currency} {int(it.get("unitPrice", 0)):,}</td>'
        f'<td style="padding: 12px 16px; color: #f1f5f9; font-size: 13px; text-align: right; font-family: monospace; font-weight: bold;">{currency} {int(it.get("quantity", 1) * it.get("unitPrice", 0)):,}</td>'
        f'</tr>'
        for it in items
    ])

    html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Payment Receipt {invoice_number}</title></head>
<body style="margin: 0; padding: 24px; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">
    <tr><td style="height: 4px; background-color: #C89630;"></td></tr>
    <tr>
      <td style="padding: 32px 32px 24px 32px; background-color: #020617; border-bottom: 1px solid #1e293b;">
        <div style="font-family: monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C89630; font-weight: bold; margin-bottom: 4px;">Official Payment Receipt</div>
        <div style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #f8fafc;">THE GLOBAL ORATORS PROJECT</div>
        <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Pan-African Forensics, Debate & Voice Sovereignty</div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #0b1329; border-bottom: 1px solid #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-family: monospace; font-size: 10px; color: #C89630; text-transform: uppercase;">Official Payee</div>
              <div style="font-weight: bold; font-size: 14px; color: #f8fafc;">Global Orators Project</div>
              <div style="color: #94a3b8; font-size: 12px;">Nairobi, Kenya</div>
              <div style="color: #94a3b8; font-size: 12px;">director@globaloratorsproject.com</div>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: right;">
              <div style="font-family: monospace; font-size: 10px; color: #C89630; text-transform: uppercase;">Billed Client</div>
              <div style="font-weight: bold; font-size: 14px; color: #f8fafc;">{invoice.get("clientName", "Valued Client")}</div>
              <div style="color: #94a3b8; font-size: 12px;">{target_email}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; border-bottom: 1px solid #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color: #94a3b8; font-size: 12px; padding-bottom: 4px;">Invoice Number:</td><td style="text-align: right; font-family: monospace; font-weight: bold; color: #f8fafc;">{invoice_number}</td></tr>
          <tr><td style="color: #94a3b8; font-size: 12px; padding-bottom: 4px;">Reference:</td><td style="text-align: right; font-family: monospace; color: #38bdf8;">{txn_id}</td></tr>
          <tr><td style="color: #94a3b8; font-size: 12px;">Settlement Date:</td><td style="text-align: right; font-family: monospace; color: #cbd5e1;">{settled_date}</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="border-bottom: 1px solid #334155;">
              <th style="padding: 8px 16px; text-align: left; font-family: monospace; font-size: 10px; color: #94a3b8;">Deliverable</th>
              <th style="padding: 8px 16px; text-align: center; font-family: monospace; font-size: 10px; color: #94a3b8;">Qty</th>
              <th style="padding: 8px 16px; text-align: right; font-family: monospace; font-size: 10px; color: #94a3b8;">Unit Price</th>
              <th style="padding: 8px 16px; text-align: right; font-family: monospace; font-size: 10px; color: #94a3b8;">Total</th>
            </tr>
          </thead>
          <tbody>{items_html}</tbody>
        </table>
        <div style="border-top: 1px solid #334155; padding-top: 12px; margin-top: 16px; display: flex; justify-content: space-between;">
          <span style="font-weight: bold; color: #f8fafc;">TOTAL SETTLED:</span>
          <span style="font-weight: bold; font-family: monospace; color: #C89630; font-size: 18px;">{currency} {int(total):,}</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #020617; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #1e293b;">
        Global Orators Project · Nairobi, Kenya · director@globaloratorsproject.com
      </td>
    </tr>
  </table>
</body>
</html>"""

    text_body = f"Payment Receipt: {invoice_number}\\nAmount: {currency} {total}\\nPayee: Global Orators Project, Nairobi, Kenya\\nReference: {txn_id}"
    subject = f"Payment Receipt: {invoice_number} — The Global Orators Project"

    import asyncio
    from app.services.email import _dispatch_smtp_email_sync
    sent = await asyncio.to_thread(_dispatch_smtp_email_sync, target_email, subject, text_body, html_body)
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to dispatch receipt email via GOP email service")

    return {"success": True, "message": f"Receipt successfully emailed to {target_email}"}
