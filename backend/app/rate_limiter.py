"""
Rate limiting engine for sensitive authentication, lookup, and inquiry routes.
Protects against brute-force credential stuffing, profile enumeration, and spam attacks.
Includes trusted proxy validation to prevent X-Forwarded-For header spoofing.
"""

import time
import asyncio
import ipaddress
import logging
from typing import Dict, List, Optional
from fastapi import Request, HTTPException, status
from app.config import settings

logger = logging.getLogger("globalorators.ratelimiter")

# RFC 1918 private subnets, loopback, and carrier-grade NAT
DEFAULT_TRUSTED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("fe80::/10"),
]


def is_trusted_proxy(ip_str: Optional[str]) -> bool:
    """
    Validates whether the immediate peer IP belongs to a trusted proxy network.
    In testing environments, 'testclient' is also treated as a trusted harness proxy.
    """
    if not ip_str:
        return False
    if settings.TESTING and ip_str == "testclient":
        return True
    try:
        clean_ip = ip_str.strip("[]").split("%")[0]
        addr = ipaddress.ip_address(clean_ip)
        return any(addr in net for net in DEFAULT_TRUSTED_NETWORKS)
    except ValueError:
        return False


def get_client_ip(request: Request) -> str:
    """
    Extracts the real client IP address securely.
    X-Forwarded-For is strictly evaluated ONLY when the immediate socket connection
    is from an authorized trusted proxy or reverse proxy gateway (e.g. Render / Cloudflare).
    Direct connections cannot spoof X-Forwarded-For to evade rate limits.
    """
    peer_ip = request.client.host if request.client else "unknown"
    if not is_trusted_proxy(peer_ip):
        return peer_ip

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        ips = [ip.strip() for ip in forwarded_for.split(",") if ip.strip()]
        if ips:
            return ips[0]

    return peer_ip


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
    Extracts client IP using trusted proxy boundary checks and enforces limits.
    """
    async def dependency(request: Request):
        if settings.TESTING:
            return

        client_ip = get_client_ip(request)
        key = f"{key_prefix}:{client_ip}"
        allowed = await rate_limiter.check(key, limit, window_seconds)
        if not allowed:
            logger.warning(f"Rate limit exceeded for '{key}' on {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )

    return dependency
