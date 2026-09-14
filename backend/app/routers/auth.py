"""
Authentication Router
"""

import uuid
import secrets
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.client import Client
from app.models.otp import EmailOTP
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    UserResponse,
    TokenResponse,
    SendOtpRequest,
    VerifyOtpRequest,
    OtpResponse,
    CheckEmailRequest,
    CheckEmailResponse
)
from app.security import verify_password, get_password_hash, create_access_token
from app.config import settings
from app.rate_limiter import rate_limit
from app.services.email import send_otp_email

logger = logging.getLogger(__name__)

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
        avatar=req.avatar or "",
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


@router.post(
    "/check-email",
    response_model=CheckEmailResponse,
    dependencies=[Depends(rate_limit(limit=30, window_seconds=60, key_prefix="auth_check_email"))]
)
async def check_email(req: CheckEmailRequest, db: AsyncSession = Depends(get_db)):
    """Check if an email is registered and which auth method is configured."""
    clean_email = req.email.strip().lower()
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalar_one_or_none()

    if not user:
        return CheckEmailResponse(
            email=clean_email,
            exists=False,
            auth_method="none",
            role=None
        )

    if user.google_id and (not user.hashed_password or user.hashed_password == ""):
        auth_method = "google"
    elif user.google_id and user.hashed_password:
        auth_method = "both"
    else:
        auth_method = "password"

    return CheckEmailResponse(
        email=clean_email,
        exists=True,
        auth_method=auth_method,
        role=user.role
    )


import base64
import json
from app.schemas.auth import GoogleAuthRequest


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


@router.post(
    "/otp/send",
    response_model=OtpResponse,
    dependencies=[Depends(rate_limit(limit=10, window_seconds=60, key_prefix="auth_otp_send"))]
)
async def send_otp(req: SendOtpRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate a 6-digit cryptographic verification code and dispatch to the speaker's email via SMTP SSL.
    """
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required"
        )

    # Verify that the speaker profile exists in client roster or user accounts
    client_match = await db.execute(select(Client).where(Client.email.ilike(email_clean)))
    user_match = await db.execute(select(User).where(User.email.ilike(email_clean)))
    if not client_match.scalars().first() and not user_match.scalars().first():
        # Anti-enumeration (M2): Uniform response for unrecognized addresses while preserving audit log
        logger.info(f"OTP dispatch requested for unregistered orator email: {email_clean}")
        return OtpResponse(
            status="sent",
            email=email_clean,
            message="If an orator profile exists for this email address, a 6-digit verification passcode has been dispatched."
        )

    # Invalidate any existing unused OTPs for this email address to prevent replay
    existing_otps = await db.execute(
        select(EmailOTP).where((EmailOTP.email == email_clean) & (EmailOTP.used == False))
    )
    for old_otp in existing_otps.scalars().all():
        old_otp.used = True

    # Generate cryptographically random 6-digit passcode
    code = f"{secrets.randbelow(900000) + 100000}"
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=10)

    otp_record = EmailOTP(
        id=f"otp-{uuid.uuid4().hex[:12]}",
        email=email_clean,
        hashed_code=get_password_hash(code),
        expires_at=expires_at,
        attempts=0,
        used=False,
        created_at=now
    )
    db.add(otp_record)
    await db.commit()

    # Dispatch email via threadpool without blocking asyncio loop
    delivered = await send_otp_email(email_clean, code)
    if not delivered and not settings.TESTING:
        # Fail-closed (H1): Do not report success or leave usable OTP if delivery fails
        logger.error(f"SMTP delivery failed for {email_clean}. Canceling OTP record.")
        await db.delete(otp_record)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to dispatch verification email. Please verify mail server configuration or contact support."
        )

    return OtpResponse(
        status="sent",
        email=email_clean,
        message="If an orator profile exists for this email address, a 6-digit verification passcode has been dispatched."
    )


@router.post(
    "/otp/verify",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(limit=15, window_seconds=60, key_prefix="auth_otp_verify"))]
)
async def verify_otp(req: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify single-use passcode and issue authenticated JWT bearer session bound to speaker identity.
    """
    email_clean = req.email.strip().lower()
    code_clean = req.code.strip()

    if not email_clean or not code_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and verification passcode are required"
        )

    now = datetime.now(timezone.utc)

    # Allow testing bypass code for deterministic automated testing
    is_test_bypass = settings.TESTING and code_clean == "123456"

    # Query active, unexpired, unused OTP record
    stmt = (
        select(EmailOTP)
        .where(
            (EmailOTP.email == email_clean) &
            (EmailOTP.used == False) &
            (EmailOTP.expires_at > now)
        )
        .order_by(EmailOTP.created_at.desc())
    )
    result = await db.execute(stmt)
    otp_record = result.scalars().first()

    if not otp_record and not is_test_bypass:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification passcode has expired or is invalid. Please request a new code."
        )

    if otp_record:
        if otp_record.attempts >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Maximum verification attempts exceeded. Please request a new passcode."
            )

        if not verify_password(code_clean, otp_record.hashed_code) and not is_test_bypass:
            otp_record.attempts += 1
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid verification passcode. Please check your email and try again."
            )

        # Mark OTP as successfully consumed
        otp_record.used = True
        await db.commit()

    # Look up or auto-provision verified speaker account
    user_res = await db.execute(select(User).where(User.email == email_clean))
    user = user_res.scalar_one_or_none()

    if not user:
        c_res = await db.execute(select(Client).where(Client.email.ilike(email_clean)))
        matched_client = c_res.scalar_one_or_none()
        full_name = matched_client.name if matched_client else email_clean.split("@")[0].title()
        avatar = matched_client.avatar if matched_client else ""

        user = User(
            id=f"speaker-{uuid.uuid4().hex[:8]}",
            email=email_clean,
            hashed_password="",
            full_name=full_name,
            role="speaker",
            avatar=avatar,
            is_active=True,
            created_at=now
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

