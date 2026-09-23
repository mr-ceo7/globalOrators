"""
System Configuration & Dynamic Infrastructure Status Router
Handles dynamic domain discovery (e.g. Jitsi active tunnel URL) with fail-safe persistence.
"""

import json
import hmac
import os
import re
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Request

from app.config import settings

router = APIRouter(prefix="/system", tags=["System Configuration"])

# Local persistence file for jitsi domain
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_jitsi_cache_path = os.path.join(_backend_dir, "jitsi_domain.json")


class JitsiDomainUpdate(BaseModel):
    domain: str = Field(..., description="Active Jitsi domain or full URL")
    secret_key: Optional[str] = Field(None, description="Shared secret or admin authentication key")


class JitsiDomainResponse(BaseModel):
    domain: str
    url: str
    updated_at: str
    source: str


def _clean_domain(raw: str) -> str:
    """Normalize raw URL or domain string down to clean domain name."""
    cleaned = raw.strip()
    cleaned = re.sub(r"^https?://", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0].strip()
    return cleaned


def _read_persisted_jitsi_domain() -> Optional[dict]:
    if os.path.exists(_jitsi_cache_path):
        try:
            with open(_jitsi_cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and data.get("domain"):
                    return data
        except Exception:
            return None
    return None


@router.get("/jitsi-domain", response_model=JitsiDomainResponse)
async def get_jitsi_domain():
    """
    Returns the currently active Jitsi domain for live rehearsal rooms.
    Prioritizes the live auto-rotated tunnel domain, falling back to environment or default.
    """
    cached = _read_persisted_jitsi_domain()
    if cached and cached.get("domain"):
        dom = _clean_domain(cached["domain"])
        return JitsiDomainResponse(
            domain=dom,
            url=f"https://{dom}",
            updated_at=cached.get("updated_at", datetime.now(timezone.utc).isoformat()),
            source="tunnel_watchdog"
        )

    # Fallback to configured domain or environment
    env_dom = os.getenv("VITE_JITSI_DOMAIN") or "meet.globalorators.com"
    clean_dom = _clean_domain(env_dom)
    return JitsiDomainResponse(
        domain=clean_dom,
        url=f"https://{clean_dom}",
        updated_at=datetime.now(timezone.utc).isoformat(),
        source="default_fallback"
    )


@router.post("/jitsi-domain", response_model=JitsiDomainResponse)
async def update_jitsi_domain(payload: JitsiDomainUpdate, request: Request):
    """
    Updates the active Jitsi domain dynamically when the tunnel rotates.
    Requires JITSI_UPDATE_TOKEN, sent as the X-Jitsi-Update-Token header (or secret_key).
    The caller's address is not trusted: behind a tunnel or proxy every request looks local.
    """
    client_ip = request.client.host if request.client else "unknown"
    expected = settings.JITSI_UPDATE_TOKEN
    provided = request.headers.get("X-Jitsi-Update-Token") or payload.secret_key or ""
    if not expected or not hmac.compare_digest(provided.encode(), expected.encode()):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Updating the live-room domain requires a valid update token."
        )

    clean_dom = _clean_domain(payload.domain)
    if not clean_dom or len(clean_dom) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid domain format provided."
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        "domain": clean_dom,
        "url": f"https://{clean_dom}",
        "updated_at": now_iso,
        "updated_by": client_ip,
    }

    try:
        tmp_path = f"{_jitsi_cache_path}.tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(record, f, indent=2)
        os.replace(tmp_path, _jitsi_cache_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist active Jitsi domain: {e}"
        )

    return JitsiDomainResponse(
        domain=clean_dom,
        url=f"https://{clean_dom}",
        updated_at=now_iso,
        source="tunnel_watchdog"
    )
