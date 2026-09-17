"""
Message Notification Debouncer and Presence-Aware Email Dispatcher.
Batches incoming direct messages for offline recipients and avoids sending emails to active online users.
"""

import asyncio
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime

from app.config import settings
from app.services.email import send_direct_message_email
from app.services.events import sse_manager

logger = logging.getLogger("globalorators.notifications")


@dataclass
class PendingNotification:
    recipient_email: str
    recipient_name: str
    sender_name: str
    sender_role: str
    thread_url: str
    user_id: Optional[str] = None
    client_id: Optional[str] = None
    snippets: List[str] = field(default_factory=list)
    timer_task: Optional[asyncio.Task] = None
    created_at: float = field(default_factory=lambda: datetime.now().timestamp())


class MessageNotificationDebouncer:
    """
    Debounces message notification emails to recipients.
    Only dispatches email notifications when the recipient is offline on the platform.
    If multiple messages arrive within the debounce window, batches them into a single consolidated email.
    """

    def __init__(self, debounce_seconds: Optional[int] = None):
        self._debounce_seconds = debounce_seconds
        # Key: (recipient_email.lower(), thread_url) -> PendingNotification
        self._pending: Dict[str, PendingNotification] = {}
        self._lock = asyncio.Lock()

    @property
    def debounce_seconds(self) -> int:
        if self._debounce_seconds is not None:
            return self._debounce_seconds
        if settings.TESTING:
            return 0
        return getattr(settings, "MESSAGE_EMAIL_DEBOUNCE_SECONDS", 60)

    async def queue_message_notification(
        self,
        recipient_email: str,
        recipient_name: str,
        sender_name: str,
        sender_role: str,
        message_snippet: str,
        thread_url: str,
        user_id: Optional[str] = None,
        client_id: Optional[str] = None,
    ):
        """
        Check recipient presence; if online via SSE, suppress email.
        If offline, debounce and batch notification.
        """
        if not recipient_email:
            return

        # 1. Presence check: Is the recipient actively connected via SSE?
        is_online = sse_manager.is_user_online(
            user_id=user_id,
            client_id=client_id,
            email=recipient_email
        )
        if is_online:
            logger.info(
                f"[Debouncer] Recipient {recipient_email} (user={user_id}, client={client_id}) "
                f"is actively online on the platform. Notification email suppressed."
            )
            return

        key = f"{recipient_email.strip().lower()}:{thread_url}"

        delay = self.debounce_seconds
        should_dispatch_now = False

        async with self._lock:
            pending = self._pending.get(key)
            if pending:
                # Cancel existing timer if running
                if pending.timer_task and not pending.timer_task.done():
                    pending.timer_task.cancel()
                pending.snippets.append(message_snippet)
                pending.sender_name = sender_name
                pending.sender_role = sender_role
            else:
                pending = PendingNotification(
                    recipient_email=recipient_email,
                    recipient_name=recipient_name,
                    sender_name=sender_name,
                    sender_role=sender_role,
                    thread_url=thread_url,
                    user_id=user_id,
                    client_id=client_id,
                    snippets=[message_snippet]
                )
                self._pending[key] = pending

            if delay <= 0:
                should_dispatch_now = True
            else:
                pending.timer_task = asyncio.create_task(self._wait_and_dispatch(key, delay))

        if should_dispatch_now:
            await self._dispatch_pending(key)


    async def _wait_and_dispatch(self, key: str, delay: int):
        try:
            await asyncio.sleep(delay)
            await self._dispatch_pending(key)
        except asyncio.CancelledError:
            # Debounce timer reset by newer incoming message
            pass
        except Exception as err:
            logger.error(f"[Debouncer] Error in debounce timer for {key}: {err}")

    async def _dispatch_pending(self, key: str):
        async with self._lock:
            pending = self._pending.pop(key, None)

        if not pending:
            return

        if pending.timer_task and not pending.timer_task.done():
            pending.timer_task.cancel()

        if not pending.snippets:
            return

        # Re-verify presence one more time before firing email: did recipient come online?
        if sse_manager.is_user_online(
            user_id=pending.user_id,
            client_id=pending.client_id,
            email=pending.recipient_email
        ):
            logger.info(
                f"[Debouncer] Recipient {pending.recipient_email} came online before debounce expired. "
                f"Email notification skipped."
            )
            return

        # Format consolidated message snippet
        if len(pending.snippets) == 1:
            snippet_text = pending.snippets[0]
        else:
            snippet_text = f"({len(pending.snippets)} new messages):\n" + "\n".join(
                f"• {s}" for s in pending.snippets[-5:]
            )

        logger.info(
            f"[Debouncer] Dispatching debounced notification email to {pending.recipient_email} "
            f"({len(pending.snippets)} messages batched)"
        )
        try:
            await send_direct_message_email(
                recipient_email=pending.recipient_email,
                recipient_name=pending.recipient_name,
                sender_name=pending.sender_name,
                sender_role=pending.sender_role,
                message_snippet=snippet_text,
                thread_url=pending.thread_url
            )
        except Exception as err:
            logger.error(f"[Debouncer] Failed to send debounced email to {pending.recipient_email}: {err}")

    async def flush_all(self):
        """Immediately dispatch all pending debounced notifications."""
        async with self._lock:
            keys = list(self._pending.keys())
        for key in keys:
            await self._dispatch_pending(key)

    def is_pending(self, recipient_email: str, thread_url: str) -> bool:
        key = f"{recipient_email.strip().lower()}:{thread_url}"
        return key in self._pending


# Global debouncer singleton
message_debouncer = MessageNotificationDebouncer()
