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
