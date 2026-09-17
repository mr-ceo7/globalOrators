"""
Server-Sent Events (SSE) Event Management and Real-Time Broadcaster.
"""

import json
import asyncio
import logging
from typing import Dict, Set, Optional, Any

logger = logging.getLogger("globalorators.sse")


class SSEManager:
    """
    Manages active SSE client connections and multiplexes real-time notifications,
    direct messages, roster changes, and activity alerts.
    """

    def __init__(self):
        # Map user_id -> Set of subscriber asyncio.Queues
        self._subscribers: Dict[str, Set[asyncio.Queue]] = {}
        # Map queue -> user metadata { user_id, role, client_id }
        self._queue_meta: Dict[asyncio.Queue, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(
        self, 
        user_id: str, 
        role: str, 
        client_id: Optional[str] = None
    ) -> asyncio.Queue:
        """Register a new SSE client subscriber queue."""
        queue: asyncio.Queue = asyncio.Queue(maxsize=128)
        async with self._lock:
            if user_id not in self._subscribers:
                self._subscribers[user_id] = set()
            self._subscribers[user_id].add(queue)
            self._queue_meta[queue] = {
                "user_id": user_id,
                "role": role,
                "client_id": client_id
            }
        logger.info(f"SSE subscriber connected: user={user_id}, role={role}, active_users={len(self._subscribers)}")
        return queue

    async def unsubscribe(self, user_id: str, queue: asyncio.Queue):
        """Remove a subscriber queue when the HTTP streaming connection closes."""
        async with self._lock:
            if user_id in self._subscribers:
                self._subscribers[user_id].discard(queue)
                if not self._subscribers[user_id]:
                    del self._subscribers[user_id]
            self._queue_meta.pop(queue, None)
        logger.info(f"SSE subscriber disconnected: user={user_id}, active_users={len(self._subscribers)}")

    async def broadcast(
        self,
        event: str,
        data: Any,
        target_user_id: Optional[str] = None,
        target_role: Optional[str] = None,
        target_client_id: Optional[str] = None,
        target_coach_id: Optional[str] = None,
        event_id: Optional[str] = None
    ):
        """
        Publish an SSE event to eligible subscribers.
        Filters by targeted user, role, client, or coach when specified.
        """
        formatted_message = self.format_sse(event=event, data=data, event_id=event_id)
        
        async with self._lock:
            targets: Set[asyncio.Queue] = set()
            
            for queue, meta in self._queue_meta.items():
                u_id = meta.get("user_id")
                u_role = meta.get("role")
                u_client_id = meta.get("client_id")

                # If explicit user_id targeted
                if target_user_id and u_id != target_user_id:
                    continue

                # If targeted by role
                if target_role and u_role != target_role:
                    continue

                # If targeted by coach_id
                if target_coach_id and u_role == "coach":
                    # Head coaches also receive coach updates
                    is_head = (u_id == "coach-1" or u_id == target_coach_id)
                    if u_id != target_coach_id and not is_head:
                        continue

                # If targeted by client_id
                if target_client_id and u_role != "coach" and u_client_id != target_client_id:
                    continue

                targets.add(queue)

        for q in targets:
            try:
                q.put_nowait(formatted_message)
            except asyncio.QueueFull:
                logger.warning(f"Subscriber queue full for event '{event}', dropping message")
            except Exception as e:
                logger.warning(f"Failed to deliver SSE event to subscriber: {e}")

    @staticmethod
    def format_sse(event: str, data: Any, event_id: Optional[str] = None) -> str:
        """Format an event string according to the W3C Server-Sent Events standard."""
        serialized = json.dumps(data) if not isinstance(data, str) else data
        lines = [f"event: {event}", f"data: {serialized}"]
        if event_id:
            lines.insert(0, f"id: {event_id}")
        return "\n".join(lines) + "\n\n"


# Global singleton instance
sse_manager = SSEManager()
