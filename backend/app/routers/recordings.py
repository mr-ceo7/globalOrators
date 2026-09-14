"""
Recordings Router - Authenticated Rehearsal Audio Upload, Storage & Streaming
"""

import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.security import decode_access_token
from app.models.recording import AudioRecording
from app.models.client import Client
from app.models.user import User
from app.schemas.recording import RecordingResponse
from app.storage import storage_service

router = APIRouter(prefix="/recordings", tags=["Recordings"])

# Storage directory fallback for audio recordings
RECORDINGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "recordings"))
os.makedirs(RECORDINGS_DIR, exist_ok=True)


@router.get("", response_model=List[RecordingResponse])
async def list_recordings(
    client_id: Optional[str] = Query(None, alias="clientId"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List authenticated audio recordings with coach isolation and speaker ownership verification."""
    query = select(AudioRecording)

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower()
            or current_user.id == "coach-1"
        )
        if client_id:
            c_res = await db.execute(select(Client).where(Client.id == client_id))
            client = c_res.scalar_one_or_none()
            if not is_default_coach and client and client.coach_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: speaker recordings belong to another coach"
                )
            query = query.where(AudioRecording.client_id == client_id)
        elif not is_default_coach:
            c_res = await db.execute(select(Client.id).where(Client.coach_id == current_user.id))
            coach_client_ids = c_res.scalars().all()
            query = query.where(AudioRecording.client_id.in_(coach_client_ids))
    else:
        # Speaker role: verify ownership against speaker's registered profile
        c_res = await db.execute(select(Client).where(Client.email.ilike(current_user.email)))
        speaker_clients = c_res.scalars().all()
        speaker_ids = [c.id for c in speaker_clients]
        if client_id:
            if client_id not in speaker_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to other orator recordings"
                )
            query = query.where(AudioRecording.client_id == client_id)
        else:
            query = query.where(AudioRecording.client_id.in_(speaker_ids))

    result = await db.execute(query.order_by(AudioRecording.created_at.desc()))
    return result.scalars().all()


@router.get("/stats/storage")
async def get_storage_stats(
    current_user: User = Depends(get_current_user)
):
    """Expose durable storage usage and quota statistics (Coaches only)."""
    if current_user.role != "coach":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Storage quota statistics are restricted to faculty coaches"
        )
    return storage_service.get_storage_stats()


MAX_RECORDING_SIZE = 25 * 1024 * 1024  # 25 Megabytes
ALLOWED_MIME_PREFIXES = ("audio/", "video/webm")
VALID_AUDIO_MAGIC = (
    b"\x1a\x45\xdf\xa3",  # WebM / Matroska
    b"RIFF",              # WAV
    b"ID3",               # MP3 (ID3v2)
    b"\xff\xfb",          # MP3 frame
    b"\xff\xf3",          # MP3 frame
    b"\xff\xf2",          # MP3 frame
    b"OggS",              # OGG
)


def validate_audio_content(content: bytes, mime_type: str):
    """Validate that uploaded bytes correspond to legitimate audio data."""
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recording file is empty (0 bytes)"
        )
    if len(content) > MAX_RECORDING_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Recording file exceeds maximum permitted size of 25MB"
        )

    # Verify magic byte signatures or container headers
    is_valid_magic = any(content.startswith(magic) for magic in VALID_AUDIO_MAGIC)
    is_mp4_m4a = len(content) >= 12 and b"ftyp" in content[4:12]

    if not (is_valid_magic or is_mp4_m4a):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio binary header. File does not match supported audio container specifications (WebM, WAV, MP3, OGG, M4A)."
        )


@router.post("/upload", response_model=RecordingResponse, status_code=status.HTTP_201_CREATED)
async def upload_recording(
    file: UploadFile = File(...),
    client_id: str = Form(..., alias="clientId"),
    title: Optional[str] = Form("Rehearsal Recording"),
    duration_seconds: Optional[int] = Form(0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and durably persist an orator rehearsal recording with access control and binary verification."""
    c_res = await db.execute(select(Client).where(Client.id == client_id))
    client = c_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Speaker profile not found")

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower()
            or current_user.id == "coach-1"
        )
        if not is_default_coach and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: cannot upload recordings for another coach's speaker"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to upload recordings for other speakers"
            )

    content = await file.read()
    mime_type = file.content_type or "audio/webm"
    validate_audio_content(content, mime_type)

    recording_id = f"rec-{uuid.uuid4().hex[:12]}"
    ext = os.path.splitext(file.filename or "")[1] or ".webm"
    storage_key = f"recordings/{recording_id}{ext}"

    try:
        await storage_service.save_file(storage_key, content, mime_type)
        local_path = storage_service.get_local_path(storage_key) or os.path.join(RECORDINGS_DIR, f"{recording_id}{ext}")

        file_url = f"/api/recordings/{recording_id}/stream"
        recording = AudioRecording(
            id=recording_id,
            client_id=client_id,
            title=title or "Rehearsal Recording",
            file_path=local_path,
            storage_key=storage_key,
            file_url=file_url,
            duration_seconds=duration_seconds or 0,
            file_size_bytes=len(content),
            mime_type=mime_type
        )
        db.add(recording)
        await db.commit()
        await db.refresh(recording)
        return recording
    except Exception as exc:
        await storage_service.delete_file(storage_key)
        raise exc


@router.get("/{recording_id}/stream")
async def stream_recording(
    recording_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stream audio playback with Bearer token authentication and IDOR access control."""
    res = await db.execute(select(AudioRecording).where(AudioRecording.id == recording_id))
    recording = res.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")

    client_res = await db.execute(select(Client).where(Client.id == recording.client_id))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Associated orator profile not found")

    # Access control: coach assigned to orator, or speaker owning profile
    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower()
            or current_user.id == "coach-1"
        )
        if not is_default_coach and client.coach_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: cannot access another coach's speaker recordings"
            )
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to stream another speaker's rehearsal recording"
            )

    storage_key = getattr(recording, "storage_key", None) or f"recordings/{os.path.basename(recording.file_path)}"
    local_path = storage_service.get_local_path(storage_key) or (recording.file_path if os.path.exists(recording.file_path) else None)

    if local_path and os.path.exists(local_path):
        return FileResponse(
            path=local_path,
            media_type=recording.mime_type or "audio/webm",
            filename=os.path.basename(local_path)
        )

    # Fallback to reading from object storage
    try:
        data = await storage_service.read_file(storage_key)
        return Response(content=data, media_type=recording.mime_type or "audio/webm")
    except Exception:
        raise HTTPException(status_code=404, detail="Recording audio file missing from storage")


@router.delete("/{recording_id}")
async def delete_recording(
    recording_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete a recording entry and purge its audio file from durable storage."""
    res = await db.execute(select(AudioRecording).where(AudioRecording.id == recording_id))
    recording = res.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")

    client_res = await db.execute(select(Client).where(Client.id == recording.client_id))
    client = client_res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Associated orator profile not found")

    if current_user.role == "coach":
        is_default_coach = (
            current_user.email.lower() == settings.DEFAULT_COACH_EMAIL.lower()
            or current_user.id == "coach-1"
        )
        if not is_default_coach and client.coach_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    else:
        if not client.email or client.email.lower() != current_user.email.lower():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    storage_key = getattr(recording, "storage_key", None) or f"recordings/{os.path.basename(recording.file_path)}"
    await storage_service.delete_file(storage_key)

    if os.path.exists(recording.file_path):
        try:
            os.remove(recording.file_path)
        except OSError:
            pass

    await db.delete(recording)
    await db.commit()
    return {"message": "Recording deleted successfully", "id": recording_id}
