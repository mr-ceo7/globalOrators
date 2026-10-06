"""The Galvaniy AI gateway (AI_GATEWAY_URL), shared with JeffyTab: a plain HTTP service that reads files and answers
prompts. Global Orators uses it to read uploaded PDFs and images, and as the backup brain for curriculum import when
every Gemini key and model fails.

Protocol:
- POST /api/upload, multipart "file", header X-Session-ID -> {"filename": ...}
- POST /api/generate, JSON {messages: [{role: user|ai, content}], stream, files: [filename], session_id}, header
  X-Session-ID -> a server-sent-event-like stream: "data: <chunk>\\n\\n", where a chunk may itself contain blank
  lines, plus "[SERVER] ..." and "[DONE]" markers. With stream false and json_schema set, the reply is
  {"response": "<json text>"}.

Every call sends AI_GATEWAY_TOKEN. There's no TLS on the gateway yet. A "[ERROR] ..." chunk means the gateway's agent
gave no answer: that's raised, so the caller falls back instead of using the error as content.
"""

from __future__ import annotations

import json
import re
from typing import AsyncIterator, Optional

import httpx

from app.config import settings

# Tests can pass an httpx transport here instead of calling the gateway
_transport: Optional[httpx.AsyncBaseTransport] = None


class GatewayError(Exception):
    pass


def ready() -> bool:
    return bool((settings.AI_GATEWAY_URL or '').strip())


def _url(path: str) -> str:
    return settings.AI_GATEWAY_URL.rstrip('/') + path


def _client(timeout: float) -> httpx.AsyncClient:
    token = (settings.AI_GATEWAY_TOKEN or '').strip()
    return httpx.AsyncClient(timeout=httpx.Timeout(timeout, connect=10), transport=_transport,
                             headers={"Authorization": f"Bearer {token}"} if token else None)


async def upload(session: str, name: str, data: bytes, mime: str) -> str:
    async with _client(60) as c:
        r = await c.post(_url('/api/upload'), headers={"X-Session-ID": session},
                         files={"file": (name, data, mime or 'application/octet-stream')})
    if r.status_code != 200 or not (r.json() or {}).get('filename'):
        raise GatewayError(f"upload failed ({r.status_code})")
    return r.json()['filename']


class Chunker:
    """Rebuilds the text from the gateway's stream. Events are separated by "\\n\\ndata: "; chunks can contain blank
    lines themselves, so splitting on lines adds stray newlines."""

    SEP = '\n\ndata: '

    def __init__(self):
        self.buf = ''
        self.first = True

    def feed(self, text: str) -> list[str]:
        self.buf += text
        if self.first and self.buf.startswith('data: '):
            self.buf = self.buf[len('data: '):]
            self.first = False
        out = []
        while self.SEP in self.buf:
            piece, self.buf = self.buf.split(self.SEP, 1)
            out.append(self._lines(piece))
        return [p for p in out if not self._marker(p)]

    @staticmethod
    def _lines(piece: str) -> str:
        """An event can span several "data:" lines; each one after the first is a line break, not text."""
        return re.sub(r'\ndata: ?', '\n', piece)

    def end(self) -> list[str]:
        piece, self.buf = self.buf, ''
        piece = self._lines(piece[:-2] if piece.endswith('\n\n') else piece)
        return [] if self._marker(piece) or not piece else [piece]

    @staticmethod
    def _marker(piece: str) -> bool:
        p = piece.strip()
        return p.startswith('[SERVER]') or p == '[DONE]'


def _checked(piece: str) -> str:
    if piece.lstrip().startswith('[ERROR]'):
        raise GatewayError(piece.strip()[len('[ERROR]'):].strip() or 'no answer')
    return piece


async def generate(session: str, messages: list[dict], files: Optional[list[str]] = None, timeout: float = 120) -> AsyncIterator[str]:
    """Stream the gateway's answer as text pieces."""
    body = {"messages": messages, "stream": True, "files": files or [], "session_id": session}
    async with _client(timeout) as c:
        async with c.stream('POST', _url('/api/generate'), json=body, headers={"X-Session-ID": session}) as r:
            if r.status_code != 200:
                raise GatewayError(f"generate failed ({r.status_code})")
            ch = Chunker()
            async for text in r.aiter_text():
                for piece in ch.feed(text):
                    yield _checked(piece)
            for piece in ch.end():
                yield _checked(piece)


async def complete(session: str, messages: list[dict], files: Optional[list[str]] = None, timeout: float = 120) -> str:
    return ''.join([p async for p in generate(session, messages, files, timeout)])


async def decide(session: str, prompt: str, schema: dict, effort: str = 'low', timeout: float = 150) -> dict:
    """One structured answer: the gateway's agent replies with JSON following `schema`."""
    body = {"messages": [{"role": "user", "content": prompt}], "stream": False, "json_schema": schema, "effort": effort,
            "session_id": session}
    async with _client(timeout) as c:
        r = await c.post(_url('/api/generate'), json=body, headers={"X-Session-ID": session})
    data = r.json() if r.headers.get('content-type', '').startswith('application/json') else {}
    if r.status_code != 200 or 'response' not in data:
        raise GatewayError(data.get('error') or f"decide failed ({r.status_code})")
    text = data['response'].strip()
    if text.startswith('```'):
        text = text.strip('`').split('\n', 1)[-1]
    try:
        out = json.loads(text)
    except ValueError:
        raise GatewayError("the answer wasn't JSON")
    if not isinstance(out, dict):
        raise GatewayError("the answer wasn't a JSON object")
    return out
