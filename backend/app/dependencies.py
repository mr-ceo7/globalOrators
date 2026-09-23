"""
FastAPI Dependencies: Database sessions and Authentication.
"""

from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.user import User
from app.security import decode_access_token

security = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide an asynchronous database session to request handlers."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Validate JWT bearer token and retrieve the authenticated coach/user."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Query user from DB (by id or email)
    result = await db.execute(select(User).where((User.id == user_id) | (User.email == user_id)))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Retrieve user if token is present, else return None."""
    if not credentials or not credentials.credentials:
        return None
    try:
        user_id = decode_access_token(credentials.credentials)
        if not user_id:
            return None
        result = await db.execute(select(User).where((User.id == user_id) | (User.email == user_id)))
        return result.scalar_one_or_none()
    except Exception:
        return None


async def require_coach(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure authenticated user has coach privileges."""
    if current_user.role != "coach":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach privileges required to access this resource"
        )
    return current_user


async def require_head_coach(
    current_user: User = Depends(require_coach)
) -> User:
    """Ensure the caller is the head coach (coach-1 or DEFAULT_COACH_EMAIL)."""
    if not settings.is_head_coach(current_user.id, current_user.email, current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the head coach can manage invoices"
        )
    return current_user
