"""Reading uploaded curriculum files into text (same routes as JeffyTab's anita_files):
- text and Markdown: decoded here;
- Word (.docx) and PowerPoint (.pptx): unpacked here;
- PDFs and images: the gateway first, then Gemini directly if the gateway can't.
So only PDFs and images leave this server; text, Word and slides are read locally."""

from __future__ import annotations

import asyncio
import io
import logging
import re
import secrets
import time
import zipfile
import xml.etree.ElementTree as ET

from app.services.ai import gateway as G
from app.services.ai import gemini

logger = logging.getLogger("globalorators.ai")

MAX_BYTES = 10 * 1024 * 1024  # per file
MAX_CHARS = 400_000  # what's kept of one file

TRANSCRIBE = ("Transcribe this file exactly and completely: every word and number as written, in reading order. "
              "Write tables as CSV. For images, give all visible text first, then a one-line description of the image. "
              "Do not summarise, explain or add anything.")


def kind(name: str, mime: str) -> str:
    n, m = name.lower(), (mime or '').lower()
    if m.startswith('image/') or re.search(r'\.(png|jpe?g|webp|gif)$', n):
        return 'image'
    if m == 'application/pdf' or n.endswith('.pdf'):
        return 'pdf'
    if n.endswith('.docx') or 'wordprocessingml' in m:
        return 'docx'
    if n.endswith('.pptx') or 'presentationml' in m:
        return 'pptx'
    if re.search(r'\.(txt|md|markdown)$', n) or m.startswith('text/'):
        return 'text'
    return 'other'


def _text(data: bytes) -> str:
    for enc in ('utf-8-sig', 'utf-16'):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode('latin-1')


W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
MAX_PART_BYTES = 30 * 1024 * 1024  # decompressed size of one part: guards against zip bombs


def _xml(z: zipfile.ZipFile, name: str) -> ET.Element:
    if z.getinfo(name).file_size > MAX_PART_BYTES:
        raise ValueError("too large")
    return ET.fromstring(z.read(name))


def _w_para(p: ET.Element) -> tuple[str, list[ET.Element]]:
    """A Word paragraph's own text, plus the paragraphs of any text boxes inside it (read separately, in order)."""
    out, boxes = [], []

    def walk(el: ET.Element):
        for c in el:
            if c.tag == W + 'txbxContent':
                boxes.extend(c.iter(W + 'p'))
                continue
            if c.tag == W + 't':
                out.append(c.text or '')
            elif c.tag == W + 'tab':
                out.append('\t')
            elif c.tag in (W + 'br', W + 'cr'):
                out.append('\n')
            walk(c)

    walk(p)
    return ''.join(out), boxes


def _w_block(el: ET.Element, lines: list[str]) -> None:
    """Body content in reading order: paragraphs, tables (one line per row, cells split by |), content controls."""
    for c in el:
        if c.tag == W + 'p':
            text, boxes = _w_para(c)
            lines.append(text)
            for b in boxes:
                lines.append(_w_para(b)[0])
        elif c.tag == W + 'tbl':
            for row in c.iter(W + 'tr'):
                cells = []
                for cell in row.findall(W + 'tc'):
                    sub: list[str] = []
                    _w_block(cell, sub)
                    cells.append(' / '.join(t.strip() for t in sub if t.strip()))
                lines.append(' | '.join(cells))
        elif c.tag in (W + 'sdt', W + 'sdtContent', W + 'customXml', W + 'smartTag'):
            _w_block(c, lines)


def _docx(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        names = set(z.namelist())
        body: list[str] = []
        _w_block(_xml(z, 'word/document.xml').find(W + 'body'), body)
        sections = ['\n'.join(body).strip()]
        # Headers, footers, footnotes, endnotes and comments often hold dates, unit names and coach notes
        extra = [('Headers', r'word/header\d*\.xml'), ('Footers', r'word/footer\d*\.xml'),
                 ('Footnotes', r'word/footnotes\.xml'), ('Endnotes', r'word/endnotes\.xml'), ('Comments', r'word/comments\.xml')]
        for label, pattern in extra:
            seen, lines = set(), []
            for name in sorted(n for n in names if re.fullmatch(pattern, n)):
                part: list[str] = []
                root = _xml(z, name)
                for container in [root] + list(root):  # footnotes/comments wrap their paragraphs one level down
                    _w_block(container, part)
                for t in part:
                    t = t.strip()
                    if t and t not in seen:
                        seen.add(t)
                        lines.append(t)
            if lines:
                sections.append(f"# {label}\n" + '\n'.join(lines))
    return '\n\n'.join(s for s in sections if s)


def _a_text(root: ET.Element) -> list[str]:
    out = []
    for p in root.iter(A + 'p'):
        t = ''.join((r.text or '') if r.tag == A + 't' else '\n' for r in p.iter() if r.tag in (A + 't', A + 'br')).strip()
        if t:
            out.append(t)
    return out


def _pptx(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        names = set(z.namelist())
        slides = sorted((n for n in names if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)),
                        key=lambda n: int(re.search(r'(\d+)\.xml$', n).group(1)))
        out = []
        for i, name in enumerate(slides, 1):
            text = _a_text(_xml(z, name))
            # Speaker notes: linked from the slide's relationships
            rels = f"ppt/slides/_rels/{name.rsplit('/', 1)[1]}.rels"
            notes = []
            if rels in names:
                m = re.search(r'Target="\.\./notesSlides/(notesSlide\d+\.xml)"', z.read(rels).decode('utf-8', 'replace'))
                if m and f"ppt/notesSlides/{m.group(1)}" in names:
                    notes = [t for t in _a_text(_xml(z, f"ppt/notesSlides/{m.group(1)}")) if not t.isdigit()]
            if text or notes:
                out.append(f"# Slide {i}\n" + '\n'.join(text) + (("\nSpeaker notes:\n" + '\n'.join(notes)) if notes else ''))
    return '\n\n'.join(out)


async def _via_gateway(session: str, name: str, data: bytes, mime: str) -> str:
    # Each read gets its own gateway session: an upload there clears the session's other files
    session = f"{session}-{secrets.token_hex(4)}"
    filename = await G.upload(session, name, data, mime)
    return (await G.complete(session, [{"role": "user", "content": TRANSCRIBE}], [filename])).strip()


async def read(name: str, mime: str, data: bytes, session: str, deadline: float | None = None) -> tuple[str, str]:
    """Returns (text, read_by). Raises ValueError with a short reason the coach can see.
    `deadline` (time.monotonic()) bounds the gateway and Gemini reads of PDFs and images."""
    k = kind(name, mime)
    if k == 'other':
        raise ValueError(f"{name}: that file type isn't supported. Use PDF, Word (.docx), PowerPoint (.pptx), text, Markdown or an image.")
    try:
        if k == 'text':
            return _text(data)[:MAX_CHARS], 'server'
        if k == 'docx':
            return _docx(data)[:MAX_CHARS], 'server'
        if k == 'pptx':
            return _pptx(data)[:MAX_CHARS], 'server'
    except (zipfile.BadZipFile, KeyError, ET.ParseError, ValueError, AttributeError):
        raise ValueError(f"{name}: the file looks damaged and couldn't be opened.")
    # PDFs and images: the gateway first, Gemini if it can't. The gateway gets at most two thirds of the time left,
    # so Gemini still has a chance when the gateway hangs.
    fallback_mime = 'application/pdf' if k == 'pdf' else 'image/png'
    for how in ('gateway', 'gemini'):
        left = None if deadline is None else deadline - time.monotonic()
        if left is not None and left < gemini.MIN_ATTEMPT_SECONDS:
            break
        try:
            if how == 'gateway' and G.ready():
                text = await asyncio.wait_for(_via_gateway(session, name, data, mime), left * 2 / 3 if left else None)
            elif how == 'gemini':
                text = (await gemini.vision(mime or fallback_mime, data, TRANSCRIBE, deadline)).strip()
            else:
                continue
        except Exception as e:  # try the next way
            logger.info("Curriculum import: %s couldn't read %s (%s)", how, name, type(e).__name__)
            continue
        if text:
            return text[:MAX_CHARS], how
    if k == 'pdf' and b'/Encrypt' in data[:2048] + data[-4096:]:
        raise ValueError(f"{name} is password-protected. Remove the password (or export it again without one) and upload it again.")
    if left is not None and left < gemini.MIN_ATTEMPT_SECONDS:
        raise ValueError(f"{name}: reading it took too long. Try a shorter file, or upload it as Word or text.")
    raise ValueError(f"{name}: couldn't read the file. Try again in a minute, or upload it as Word or text.")
