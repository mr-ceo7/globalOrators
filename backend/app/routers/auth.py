"""
Authentication Router
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse, TokenResponse
from app.security import verify_password, get_password_hash, create_access_token
from app.config import settings
from app.rate_limiter import rate_limit

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register", 
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(limit=10, window_seconds=60, key_prefix="auth_register"))]
)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new account (speakers by default; coach role requires valid invite code)."""
    desired_role = req.role if req.role in ["coach", "speaker"] else "speaker"
    if desired_role == "coach":
        if not req.coach_invite_code or req.coach_invite_code != settings.COACH_INVITE_CODE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Valid coach invite code required to create a coach account"
            )

    # Check if user already exists
    existing = await db.execute(select(User).where(User.email == req.email.strip().lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    new_user = User(
        id=f"{desired_role}-{uuid.uuid4().hex[:8]}",
        email=req.email.strip().lower(),
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role=desired_role,
        avatar=req.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_access_token(new_user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post(
    "/login", 
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(limit=10, window_seconds=60, key_prefix="auth_login"))]
)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Log in with email and password to receive JWT token."""
    email_clean = req.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


import base64
import json
from datetime import date
from app.models.client import Client
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse, TokenResponse, GoogleAuthRequest


@router.post(
    "/google", 
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(limit=20, window_seconds=60, key_prefix="auth_google"))]
)
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with Google ID token from One Tap or Google Sign-In."""
    google_id = None
    email = None
    name = None
    picture = None

    # Verify via google-auth
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        idinfo = id_token.verify_oauth2_token(
            req.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        google_id = idinfo.get("sub")
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
    except Exception:
        # Strictly restricted to TESTING environment and mock header signatures
        if settings.TESTING and req.credential.startswith("mockHeader."):
            try:
                parts = req.credential.split(".")
                if len(parts) >= 2:
                    padding = "=" * (4 - len(parts[1]) % 4)
                    payload_str = base64.urlsafe_b64decode(parts[1] + padding).decode("utf-8")
                    payload = json.loads(payload_str)
                    google_id = payload.get("sub") or payload.get("id")
                    email = payload.get("email")
                    name = payload.get("name") or payload.get("given_name")
                    picture = payload.get("picture")
            except Exception:
                pass

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credentials or token verification failed"
        )

    email_clean = email.strip().lower()
    full_name = name or email_clean.split("@")[0].title()
    avatar_url = picture or ""

    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalar_one_or_none()

    if not user:
        # Determine role: only allow coach if invite code is provided and matches
        if req.role == "coach" and req.coach_invite_code == settings.COACH_INVITE_CODE:
            role = "coach"
        else:
            role = "speaker"

        user = User(
            id=f"{role}-{uuid.uuid4().hex[:8]}",
            email=email_clean,
            hashed_password="",
            full_name=full_name,
            role=role,
            google_id=google_id,
            avatar=avatar_url,
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        role = user.role
        updated = False
        if google_id and not user.google_id:
            user.google_id = google_id
            updated = True
        if picture and user.avatar != picture:
            user.avatar = picture
            updated = True
        if updated:
            await db.commit()
            await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the profile of currently authenticated coach or speaker."""
    return UserResponse.model_validate(current_user)

