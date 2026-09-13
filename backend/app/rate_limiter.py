"""
In-memory sliding-window rate limiter for sensitive authentication, lookup, and inquiry routes.
Protects against brute-force credential stuffing, profile enumeration, and spam attacks.
"""

import time
import asyncio
from typing import Dict, List
from fastapi import Request, HTTPException, status
from app.config import settings


class InMemoryRateLimiter:
    def __init__(self):
        self._requests: Dict[str, List[float]] = {}
        self._lock = asyncio.Lock()

    async def check(self, key: str, limit: int, window_seconds: int, ignore_testing: bool = False) -> bool:
        """
        Check if key exceeds limit within window_seconds.
        Returns True if allowed, False if limit exceeded.
        """
        if settings.TESTING and not ignore_testing:
            return True

        now = time.time()
        cutoff = now - window_seconds

        async with self._lock:
            timestamps = self._requests.get(key, [])
            # Prune old timestamps
            valid_timestamps = [t for t in timestamps if t > cutoff]
            if len(valid_timestamps) >= limit:
                self._requests[key] = valid_timestamps
                return False
            valid_timestamps.append(now)
            self._requests[key] = valid_timestamps
            return True

    def reset(self):
        """Clear all rate limit state (useful for tests)."""
        self._requests.clear()


rate_limiter = InMemoryRateLimiter()


def rate_limit(limit: int = 15, window_seconds: int = 60, key_prefix: str = "general"):
    """
    FastAPI dependency factory for rate limiting sensitive endpoints.
    Extracts client IP (with X-Forwarded-For support) and enforces limits.
    """
    async def dependency(request: Request):
        if settings.TESTING:
            return
        
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        key = f"{key_prefix}:{client_ip}"
        allowed = await rate_limiter.check(key, limit, window_seconds)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )

    return dependency
