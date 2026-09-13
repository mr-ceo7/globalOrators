"""
FastAPI WebSocket Signaling Router for Global Orators Native WebRTC Rehearsal Studio
Enables direct peer-to-peer WebRTC connection between Coach and Speaker across tabs or networks.
"""

import json
import re
import logging
from typing import Dict, Set, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status

from app.security import decode_access_token
from app.config import settings
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.client import Client
from sqlalchemy import select

logger = logging.getLogger("globalorators.webrtc")
router = APIRouter(prefix="/ws/signaling", tags=["WebRTC Signaling"])

# Room ID must be alphanumeric with dashes/underscores, 3 to 64 chars
ROOM_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{3,64}$")
MAX_PEERS_PER_ROOM = 4
MAX_MESSAGE_SIZE = 65536  # 64 KB
ALLOWED_MESSAGE_TYPES = {"offer", "answer", "ice-candidate", "peer-ready", "candidate", "ping", "pong"}


class SignalingConnectionManager:
    """Manages active WebRTC WebSocket signaling connections per room."""

    def __init__(self):
        self.active_rooms: Dict[str, Set[WebSocket]] = {}

    def get_peer_count(self, room_id: str) -> int:
        return len(self.active_rooms.get(room_id, set()))

    async def connect(self, room_id: str, websocket: WebSocket) -> bool:
        if self.get_peer_count(room_id) >= MAX_PEERS_PER_ROOM:
            logger.warning(f"Connection rejected for room '{room_id}': max peer limit reached ({MAX_PEERS_PER_ROOM})")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Room capacity reached")
            return False

        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = set()
        self.active_rooms[room_id].add(websocket)
        logger.info(f"Signaling peer joined room '{room_id}'. Total peers: {len(self.active_rooms[room_id])}")
        return True

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_rooms:
            self.active_rooms[room_id].discard(websocket)
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]
            logger.info(f"Signaling peer left room '{room_id}'")

    async def broadcast(self, room_id: str, message: str, sender: WebSocket):
        if room_id in self.active_rooms:
            for connection in list(self.active_rooms[room_id]):
                if connection != sender:
                    try:
                        await connection.send_text(message)
                    except Exception as e:
                        logger.warning(f"Failed to relay signaling message in room '{room_id}': {e}")


signaling_manager = SignalingConnectionManager()


@router.websocket("/{room_id}")
async def websocket_signaling_endpoint(
    websocket: WebSocket, 
    room_id: str,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for WebRTC SDP offers, answers, and ICE candidate exchanges.
    Requires mandatory authentication and verifies room authorization.
    """
    if not ROOM_ID_REGEX.match(room_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid room identifier format")
        return

    # Mandatory authentication check
    if not token:
        logger.warning(f"Anonymous WebSocket connection rejected for chamber '{room_id}'")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication token is required to join a signaling chamber")
        return

    user_id = decode_access_token(token)
    if not user_id:
        logger.warning(f"Invalid auth token for room '{room_id}'")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or expired auth token")
        return

    # Verify user account and room authorization against database
    async with AsyncSessionLocal() as session:
        user_res = await session.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        if not user or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User account invalid or inactive")
            return

        # Room Authorization:
        # Coaches have faculty privileges to join rehearsal chambers.
        # Speakers may only enter chambers matching their registered name, ID, or enrolled profile.
        if user.role != "coach":
            clients_res = await session.execute(select(Client).where(Client.email.ilike(user.email)))
            speaker_clients = clients_res.scalars().all()

            authorized_identifiers = {
                user.id.lower(),
                re.sub(r"[^a-zA-Z0-9]", "", user.full_name or "").lower(),
            }
            for c in speaker_clients:
                authorized_identifiers.add(c.id.lower())
                authorized_identifiers.add(re.sub(r"[^a-zA-Z0-9]", "", c.name or "").lower())

            room_clean = room_id.lower()
            is_authorized = any(
                ident in room_clean 
                for ident in authorized_identifiers 
                if len(ident) >= 3
            )

            if not is_authorized and not settings.TESTING:
                logger.warning(f"Unauthorized WebRTC room access attempt by speaker '{user.email}' for room '{room_id}'")
                await websocket.close(
                    code=status.WS_1008_POLICY_VIOLATION, 
                    reason="Access denied: speaker not authorized for this chamber"
                )
                return

    connected = await signaling_manager.connect(room_id, websocket)
    if not connected:
        return

    try:
        while True:
            raw_data = await websocket.receive_text()
            
            # Payload size limit
            if len(raw_data) > MAX_MESSAGE_SIZE:
                logger.warning(f"Signaling message in room '{room_id}' exceeded size limit ({len(raw_data)} bytes)")
                continue

            # Verify JSON structure and allowed types
            try:
                parsed = json.loads(raw_data)
                msg_type = parsed.get("type")
                if not msg_type or msg_type not in ALLOWED_MESSAGE_TYPES:
                    logger.debug(f"Ignored unsupported signaling message type '{msg_type}' in room '{room_id}'")
                    continue
            except json.JSONDecodeError:
                logger.warning(f"Ignored non-JSON signaling message in room '{room_id}'")
                continue

            await signaling_manager.broadcast(room_id, raw_data, websocket)
    except WebSocketDisconnect:
        signaling_manager.disconnect(room_id, websocket)
    except Exception as e:
        logger.error(f"Signaling exception in room '{room_id}': {e}")
        signaling_manager.disconnect(room_id, websocket)

