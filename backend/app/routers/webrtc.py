"""
FastAPI WebSocket Signaling Router for Global Orators Native WebRTC Rehearsal Studio
Enables direct peer-to-peer WebRTC connection between Coach and Speaker across tabs or networks.
"""

import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("globalorators.webrtc")
router = APIRouter(prefix="/ws/signaling", tags=["WebRTC Signaling"])


class SignalingConnectionManager:
    """Manages active WebRTC WebSocket signaling connections per room."""

    def __init__(self):
        self.active_rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = set()
        self.active_rooms[room_id].add(websocket)
        logger.info(f"Signaling client joined room '{room_id}'. Total peers: {len(self.active_rooms[room_id])}")

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_rooms:
            self.active_rooms[room_id].discard(websocket)
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]
            logger.info(f"Signaling client left room '{room_id}'")

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
async def websocket_signaling_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for WebRTC SDP offers, answers, and ICE candidate exchanges.
    Any message received is broadcast to all other participants in the same room.
    """
    await signaling_manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await signaling_manager.broadcast(room_id, data, websocket)
    except WebSocketDisconnect:
        signaling_manager.disconnect(room_id, websocket)
    except Exception as e:
        logger.error(f"Signaling error in room '{room_id}': {e}")
        signaling_manager.disconnect(room_id, websocket)
