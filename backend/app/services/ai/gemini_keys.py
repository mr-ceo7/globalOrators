"""Rolling Gemini keys (ported from JeffyTab). Several keys (GEMINI_API_KEY, GEMINI_API_KEY1..6) and fallback models
can be configured. Each request goes to the first key and model that isn't resting; when one runs out of quota it rests
(until its quota resets) and the next one takes the request, so free-tier limits stack.

Rest periods: a daily quota rests until midnight Pacific time (when Google resets it), a per-minute quota for the
wait Google asks for, a rejected key for an hour, an overloaded model for half a minute, a model that hangs for two minutes."""

from __future__ import annotations

import re
import time
from datetime import datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo

from app.config import settings

_resting: dict[tuple[str, str], float] = {}  # (key, model) -> monotonic time it can be used again
_cursor = 0  # where the next request starts, so load spreads across keys


def keys() -> list[str]:
    raw = [settings.GEMINI_API_KEY] + [getattr(settings, f"GEMINI_API_KEY{i}") for i in range(1, 7)]
    out: list[str] = []
    for k in raw:
        k = (k or '').strip()
        if k and k not in out:
            out.append(k)
    return out


def models() -> list[str]:
    out = [settings.AI_MODEL]
    for m in (settings.AI_FALLBACK_MODELS or '').split(','):
        if m.strip() and m.strip() not in out:
            out.append(m.strip())
    return out


def ready() -> bool:
    return bool(keys())


def candidates(model_list: Optional[list[str]] = None) -> list[tuple[str, str]]:
    """(key, model) pairs to try, in order: the preferred model on every key first, starting from the rolling cursor."""
    global _cursor
    ks = keys()
    if not ks:
        return []
    start = _cursor % len(ks)
    _cursor += 1
    ordered = ks[start:] + ks[:start]
    now = time.monotonic()
    return [(k, m) for m in (model_list or models()) for k in ordered if _resting.get((k, m), 0) <= now]


def _until_pacific_midnight() -> float:
    now = datetime.now(ZoneInfo("America/Los_Angeles"))
    nxt = (now + timedelta(days=1)).replace(hour=0, minute=0, second=5, microsecond=0)
    return (nxt - now).total_seconds()


def failed(key: str, model: str, status: int, text: str) -> bool:
    """Rest a key/model after an error response. Returns True if the error was a quota (rate) limit."""
    now = time.monotonic()
    if status == 429:
        if 'PerDay' in text:
            _resting[(key, model)] = now + _until_pacific_midnight()
        else:
            m = re.search(r'retry in ([\d.]+)s', text)
            _resting[(key, model)] = now + max(10.0, float(m.group(1)) if m else 60.0)
        return True
    if status in (400, 401, 403) and re.search(r'API key|permission|PERMISSION_DENIED|API_KEY', text):
        for m in models():  # the key itself is bad: rest it on every model
            _resting[(key, m)] = now + 3600
        return False
    if status == 404:  # model not available to this key
        _resting[(key, model)] = now + 3600
        return False
    _resting[(key, model)] = now + 30  # overloaded or failing: give it a moment
    return False


def stalled(key: str, model: str) -> None:
    """The model hung or the connection dropped: leave it alone for two minutes."""
    _resting[(key, model)] = time.monotonic() + 120


def reset() -> None:
    """Forget every rest period (tests)."""
    global _cursor
    _resting.clear()
    _cursor = 0
