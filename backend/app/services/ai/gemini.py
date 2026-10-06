"""Gemini calls through the key pool (gemini_keys): structured JSON answers and file transcription.
A key or model that fails moves the request to the next one; when all are resting, AIUnavailable is raised so the
caller can fall back to the gateway."""

from __future__ import annotations

import base64
import json
import logging
import time
from typing import Optional

import httpx

from app.services.ai import gemini_keys

logger = logging.getLogger("globalorators.ai")

# Tests can pass an httpx transport here instead of calling Google
_transport: Optional[httpx.AsyncBaseTransport] = None

API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class AIUnavailable(Exception):
    """No Gemini key or model could answer."""


class TooLong(Exception):
    """The answer hit the model's output limit (the document asks for more than one answer can hold)."""


MIN_ATTEMPT_SECONDS = 15  # not worth starting an attempt with less time than this left

# Models that accept thinkingBudget 0. Extraction doesn't need thinking, and turning it off cut a 24-session
# syllabus from ~95s to ~67s. Other models get the request unchanged.
NO_THINKING_MODELS = {"gemini-2.5-flash"}


def to_gemini_schema(schema: dict) -> dict:
    """JSON Schema (lowercase types) -> Gemini's OpenAPI subset (uppercase types, no unsupported keywords)."""
    out: dict = {}
    for k, v in schema.items():
        if k == 'type':
            out['type'] = str(v).upper()
        elif k == 'properties':
            out['properties'] = {name: to_gemini_schema(sub) for name, sub in v.items()}
        elif k == 'items':
            out['items'] = to_gemini_schema(v)
        elif k in ('enum', 'required', 'description', 'minItems', 'maxItems', 'nullable'):
            out[k] = v
    return out


def _finish(data: dict) -> str:
    return ((data.get('candidates') or [{}])[0].get('finishReason') or '')


def _text(data: dict) -> str:
    parts = (((data.get('candidates') or [{}])[0].get('content') or {}).get('parts') or [])
    return ''.join(p.get('text', '') for p in parts if not p.get('thought'))


def _for_model(body: dict, model: str, fast: bool) -> dict:
    if not fast or model not in NO_THINKING_MODELS:
        return body
    config = {**body.get("generationConfig", {}), "thinkingConfig": {"thinkingBudget": 0}}
    return {**body, "generationConfig": config}


async def _generate(body: dict, timeout: float, deadline: Optional[float] = None, fast: bool = False) -> str:
    """First answer from the key pool. `deadline` (time.monotonic()) bounds all attempts together."""
    last_error = None
    async with httpx.AsyncClient(transport=_transport) as client:
        for key, model in gemini_keys.candidates():
            budget = timeout if deadline is None else min(timeout, deadline - time.monotonic())
            if budget < MIN_ATTEMPT_SECONDS:
                last_error = last_error or "out of time"
                break
            try:
                res = await client.post(API.format(model=model), json=_for_model(body, model, fast), headers={"x-goog-api-key": key},
                                        timeout=httpx.Timeout(budget, connect=min(10, budget)))
            except httpx.TransportError as e:  # timeouts and dropped connections
                gemini_keys.stalled(key, model)
                last_error = f"{model} didn't respond ({type(e).__name__})"
                continue
            if res.status_code != 200:
                gemini_keys.failed(key, model, res.status_code, res.text)
                last_error = f"{model} returned {res.status_code}"
                logger.info("Gemini %s unavailable (%s), trying the next key or model", model, res.status_code)
                continue
            data = res.json()
            if _finish(data) == 'MAX_TOKENS':
                raise TooLong(model)
            text = _text(data).strip()
            if text:
                return text
            last_error = f"{model} returned no text ({_finish(data) or 'no reason'})"
    raise AIUnavailable(last_error or "no Gemini key configured")


async def generate_json(prompt: str, schema: dict, system: str, timeout: float = 120, deadline: Optional[float] = None) -> dict:
    body = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
            "responseSchema": to_gemini_schema(schema),
        },
    }
    text = await _generate(body, timeout, deadline, fast=True)
    if text.startswith('```'):
        text = text.strip('`').split('\n', 1)[-1]
    try:
        out = json.loads(text)
    except ValueError:
        raise AIUnavailable("Gemini's answer wasn't JSON")
    if not isinstance(out, dict):
        raise AIUnavailable("Gemini's answer wasn't a JSON object")
    return out


async def vision(mime: str, data: bytes, instruction: str, deadline: Optional[float] = None) -> str:
    """Read an image or PDF inline through the key pool."""
    body = {
        "system_instruction": {"parts": [{"text": "You transcribe files faithfully."}]},
        "contents": [{"role": "user", "parts": [
            {"inline_data": {"mime_type": mime, "data": base64.b64encode(data).decode()}},
            {"text": instruction},
        ]}],
        "generationConfig": {"temperature": 0},
    }
    return await _generate(body, 120, deadline)
