"""
Recordings Router - Authenticated Rehearsal Audio Upload, Storage & Streaming
"""

import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
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

router = APIRouter(prefix="/recordings", tags=["Recordings"])

# Storage directory for audio recordings
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


@router.post("/upload", response_model=RecordingResponse, status_code=status.HTTP_201_CREATED)
async def upload_recording(
    file: UploadFile = File(...),
    client_id: str = Form(..., alias="clientId"),
    title: Optional[str] = Form("Rehearsal Recording"),
    duration_seconds: Optional[int] = Form(0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and durably persist an orator rehearsal recording with access control."""
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

    recording_id = f"rec-{uuid.uuid4().hex[:12]}"
    ext = os.path.splitext(file.filename or "")[1] or ".webm"
    stored_filename = f"{recording_id}{ext}"
    file_path = os.path.join(RECORDINGS_DIR, stored_filename)

    content = await file.read()
    file_size = len(content)

    with open(file_path, "wb") as f:
        f.write(content)

    file_url = f"/api/recordings/{recording_id}/stream"
    mime_type = file.content_type or "audio/webm"

    recording = AudioRecording(
        id=recording_id,
        client_id=client_id,
        title=title or "Rehearsal Recording",
        file_path=file_path,
        file_url=file_url,
        duration_seconds=duration_seconds or 0,
        file_size_bytes=file_size,
        mime_type=mime_type
    )
    db.add(recording)
    await db.commit()
    await db.refresh(recording)
    return recording


bearer_scheme = HTTPBearer(auto_error=False)


@router.get("/{recording_id}/stream")
async def stream_recording(
    recording_id: str,
    token: Optional[str] = Query(None, description="Optional token for browser audio streaming"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
):
    """Stream audio playback with authentication and IDOR access control."""
    auth_token = credentials.credentials if credentials else token
    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to stream recordings",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = decode_access_token(auth_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_res = await db.execute(select(User).where((User.id == user_id) | (User.email == user_id)))
    current_user = user_res.scalar_one_or_none()
    if not current_user or not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

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

    if not os.path.exists(recording.file_path):
        raise HTTPException(status_code=404, detail="Recording audio file missing from storage")

    return FileResponse(
        path=recording.file_path,
        media_type=recording.mime_type or "audio/webm",
        filename=os.path.basename(recording.file_path)
    )
