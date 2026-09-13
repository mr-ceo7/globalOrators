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
    Requires valid room ID format, room peer capacity check, and message structure verification.
    """
    if not ROOM_ID_REGEX.match(room_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid room identifier format")
        return

    # Validate token if supplied
    if token:
        user_id = decode_access_token(token)
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or expired auth token")
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

