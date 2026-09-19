"""
Server-Sent Events (SSE) Streaming Router
"""

import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.client import Client
from app.security import decode_access_token
from app.services.events import sse_manager

logger = logging.getLogger("globalorators.sse_router")
router = APIRouter(prefix="/events", tags=["Events"])
security = HTTPBearer(auto_error=False)


async def get_current_user_sse(
    token: Optional[str] = Query(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> User:
    """
    Authenticate SSE stream request via either:
    1. Query param ?token=... (standard browser EventSource)
    2. Authorization: Bearer <token> (fetch / curl / custom clients)
    """
    raw_token = token or (credentials.credentials if credentials else None)
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for event stream"
        )

    user_id = decode_access_token(raw_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where((User.id == user_id) | (User.email == user_id)))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        session.expunge(user)
        return user


@router.get("/stream")
async def sse_event_stream(
    request: Request,
    user: User = Depends(get_current_user_sse)
):
    """
    Establish a persistent HTTP Server-Sent Events (SSE) connection.
    Streams real-time messages, coach assignments, and activity feed notifications.
    """
    client_id: Optional[str] = None
    if user.role != "coach":
        async with AsyncSessionLocal() as session:
            c_res = await session.execute(select(Client).where((Client.email.ilike(user.email)) | (Client.id == user.id)))
            client = c_res.scalar_one_or_none()
            if client:
                client_id = client.id
            else:
                client_id = user.id

    queue = await sse_manager.subscribe(
        user_id=user.id,
        role=user.role,
        client_id=client_id,
        email=user.email
    )

    async def event_generator():
        try:
            # Send initial connected greeting
            yield sse_manager.format_sse(
                event="connected",
                data={"status": "connected", "userId": user.id, "role": user.role}
            )

            while True:
                try:
                    # Wait for next event or send keep-alive comment after 15s timeout
                    message = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield message
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat (comment line per SSE specification)
                    yield ": keep-alive\n\n"
                except asyncio.CancelledError:
                    break

        except Exception as err:
            logger.warning(f"Error in SSE stream for user {user.id}: {err}")
        finally:
            await sse_manager.unsubscribe(user_id=user.id, queue=queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.get("/presence")
async def get_presence():
    """Return real-time active SSE presence snapshot (online users and speaker clients)."""
    return sse_manager.get_presence_snapshot()

