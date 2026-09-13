"""
FastAPI WebSocket Signaling Router for Global Orators Native WebRTC Rehearsal Studio
Enables direct peer-to-peer WebRTC connection between Coach and Speaker across tabs or networks.
"""

import json
import re
import asyncio
import logging
from typing import Dict, Set, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from starlette.websockets import WebSocketState

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
ALLOWED_MESSAGE_TYPES = {
    "offer", "answer", "ice-candidate", "peer-ready", 
    "candidate", "ping", "pong", "auth", "auth-success", "peer-left"
}


def extract_speaker_id_from_room(room_id: str) -> Optional[str]:
    """
    Extracts the target speaker ID from room format:
    GlobalOrators-{speakerName}-{speakerId}
    e.g., GlobalOrators-MarcusVance-c-exec-1 -> c-exec-1
          GlobalOrators-KofiMensah-user-123 -> user-123
    """
    if room_id.startswith("GlobalOrators-"):
        parts = room_id.split("-")
        if len(parts) >= 3:
            return "-".join(parts[2:]).strip()
        elif len(parts) == 2:
            return parts[1].strip()
    return room_id.strip()


class SignalingConnectionManager:
    """Manages active WebRTC WebSocket signaling connections per room."""

    def __init__(self):
        self.active_rooms: Dict[str, Set[WebSocket]] = {}

    def get_peer_count(self, room_id: str) -> int:
        return len(self.active_rooms.get(room_id, set()))

    def add_peer(self, room_id: str, websocket: WebSocket):
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = set()
        self.active_rooms[room_id].add(websocket)
        logger.info(f"Signaling peer joined room '{room_id}'. Total peers: {len(self.active_rooms[room_id])}")

    async def connect(self, room_id: str, websocket: WebSocket) -> bool:
        if self.get_peer_count(room_id) >= MAX_PEERS_PER_ROOM:
            logger.warning(f"Connection rejected for room '{room_id}': max peer limit reached ({MAX_PEERS_PER_ROOM})")
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Room capacity reached")
            return False

        if websocket.client_state != WebSocketState.CONNECTED:
            await websocket.accept()
        self.add_peer(room_id, websocket)
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
    Supports in-band handshake authentication as well as legacy query tokens.
    Enforces exact room authorization and capacity limits.
    """
    if not ROOM_ID_REGEX.match(room_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid room identifier format")
        return

    if signaling_manager.get_peer_count(room_id) >= MAX_PEERS_PER_ROOM:
        logger.warning(f"Connection rejected for chamber '{room_id}': capacity reached")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Room capacity reached")
        return

    # In-band authentication handshake:
    # If token is not provided in query params, accept the connection and require the first
    # frame to be an auth frame {"type": "auth", "token": "..."} within 5 seconds.
    auth_token = token
    if not auth_token:
        await websocket.accept()
        try:
            raw_auth = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
            parsed_auth = json.loads(raw_auth)
            if not isinstance(parsed_auth, dict) or parsed_auth.get("type") != "auth" or not parsed_auth.get("token"):
                logger.warning(f"Invalid in-band auth payload for chamber '{room_id}'")
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="First frame must be a valid auth payload")
                return
            auth_token = parsed_auth.get("token")
        except asyncio.TimeoutError:
            logger.warning(f"In-band auth handshake timed out for chamber '{room_id}'")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication handshake timed out")
            return
        except Exception as e:
            logger.warning(f"In-band auth error for chamber '{room_id}': {e}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Malformed authentication handshake")
            return

    user_id = decode_access_token(auth_token)
    if not user_id:
        logger.warning(f"Invalid auth token for room '{room_id}'")
        if websocket.client_state != WebSocketState.CONNECTED:
            await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or expired auth token")
        return

    # Verify user account and room authorization against database
    async with AsyncSessionLocal() as session:
        user_res = await session.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        if not user or not user.is_active:
            if websocket.client_state != WebSocketState.CONNECTED:
                await websocket.accept()
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User account invalid or inactive")
            return

        # Room Authorization:
        # Coaches have faculty privileges to join rehearsal chambers.
        # Speakers may only enter chambers matching their registered ID or client ID.
        if user.role != "coach":
            clients_res = await session.execute(select(Client).where(Client.email.ilike(user.email)))
            speaker_clients = clients_res.scalars().all()

            authorized_ids = {user.id.lower()}
            for c in speaker_clients:
                authorized_ids.add(c.id.lower())

            target_speaker_id = extract_speaker_id_from_room(room_id)
            target_clean = (target_speaker_id or "").lower()

            is_authorized = (
                target_clean in authorized_ids 
                or room_id.lower() in authorized_ids
            )

            if not is_authorized:
                logger.warning(f"Unauthorized WebRTC room access attempt by speaker '{user.email}' for room '{room_id}'")
                if websocket.client_state != WebSocketState.CONNECTED:
                    await websocket.accept()
                await websocket.close(
                    code=status.WS_1008_POLICY_VIOLATION, 
                    reason="Access denied: speaker not authorized for this chamber"
                )
                return

    # Connection accepted and authenticated
    if websocket.client_state != WebSocketState.CONNECTED:
        await websocket.accept()
    signaling_manager.add_peer(room_id, websocket)

    # Acknowledge successful auth handshake
    try:
        await websocket.send_text(json.dumps({"type": "auth-success", "roomId": room_id}))
    except Exception:
        pass

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
                # If subsequent auth frame received, ignore
                if msg_type == "auth":
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
