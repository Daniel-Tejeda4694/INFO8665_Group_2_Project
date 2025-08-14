# server.py
import asyncio
import json
import os
import time
from aiohttp import web, WSMsgType
from concurrent.futures import ThreadPoolExecutor
from collections import deque, defaultdict
import cv2
from fastapi import WebSocketDisconnect
import numpy as np
from dotenv import load_dotenv
import threading

load_dotenv()

# Import the speech-to-text runner you used before (adjust path if needed)
try:
    from speech_to_text.whisper_engine import run_engine
    stt_available = True
except Exception as e:
    print("STT import failed:", e)
    stt_available = False

# Import new detection function from emotion_detector (we'll add detect_emotion below)
from emotion_detector import detect_emotion  # returns (label, conf, bbox) or (None, 0.0, None)

# Configs
HOST = os.getenv("WEBSOCKET_HOST", "0.0.0.0")
PORT = int(os.getenv("WEBSOCKET_PORT", 5000))
MAX_HISTORY = int(os.getenv("MAX_HISTORY", 10))
SAMPLE_RATE = float(os.getenv("SAMPLE_RATE", 4.0))  # detector FPS per user
THREAD_WORKERS = int(os.getenv("THREAD_WORKERS", 4))
PROCESS_WIDTH = int(os.getenv("PROCESS_WIDTH", 320))  # downscale width for detection

# State
user_histories = {}                 # user_id -> deque
user_last_processed = defaultdict(lambda: 0.0)  # user_id -> last processed time (s)

EXECUTOR = ThreadPoolExecutor(max_workers=THREAD_WORKERS)

routes = web.RouteTableDef()

@routes.get("/")
async def index(request):
    return web.Response(text="Emotion metadata WebSocket server", content_type="text/plain")

@routes.get("/ws")
async def websocket_handler(request):
    """WebSocket endpoint for streaming raw frames; returns metadata JSON messages."""
    ws = web.WebSocketResponse(max_msg_size=10 * 1024 * 1024)
    await ws.prepare(request)

    user_id = request.query.get("user")
    if not user_id:
        await ws.close(message=b"Missing user id")
        return ws

    print(f"[WS] connect user={user_id}")
    if user_id not in user_histories:
        user_histories[user_id] = deque(maxlen=MAX_HISTORY)

    try:
        async for msg in ws:
            if msg.type == WSMsgType.BINARY:
                data = msg.data  # ArrayBuffer / bytes

                now = time.time()
                # throttle processing to SAMPLE_RATE fps
                if now - user_last_processed[user_id] < 1.0 / SAMPLE_RATE:
                    continue
                user_last_processed[user_id] = now

                # decode to CV image
                nparr = np.frombuffer(data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if frame is None:
                    print(f"[WS] decode failed user={user_id}")
                    continue

                # downscale while preserving aspect ratio
                h, w = frame.shape[:2]
                if w > PROCESS_WIDTH:
                    scale = PROCESS_WIDTH / float(w)
                    frame_small = cv2.resize(frame, (PROCESS_WIDTH, int(h * scale)))
                else:
                    frame_small = frame

                # offload detection to threadpool
                loop = asyncio.get_event_loop()
                fut = loop.run_in_executor(EXECUTOR, detect_safe, frame_small, user_id)
                result = await fut  # (label, conf, bbox) or (None, 0, None)

                if result is None:
                    continue
                label, conf, bbox = result

                # bbox is in coordinates of frame_small; convert to normalized coords to let client map to its video
                if bbox is not None:
                    x1, y1, x2, y2 = bbox
                    fh, fw = frame_small.shape[:2]
                    bbox_norm = {
                        "x": x1 / fw,
                        "y": y1 / fh,
                        "w": (x2 - x1) / fw,
                        "h": (y2 - y1) / fh,
                    }
                else:
                    bbox_norm = None

                payload = {
                    "type": "emotion",
                    "label": label,
                    "confidence": float(conf),
                    "bbox": bbox_norm,
                    "timestamp": now,
                }

                # send metadata JSON back to client
                try:
                    await ws.send_str(json.dumps(payload))
                except Exception as e:
                    print(f"[WS] send error user={user_id} err={e}")

            elif msg.type == WSMsgType.TEXT:
                txt = msg.data.strip()
                if txt == "ping":
                    await ws.send_str("pong")
                else:
                    # future control messages
                    await ws.send_str(json.dumps({"type": "ack", "msg": txt}))

            elif msg.type == WSMsgType.ERROR:
                print("ws connection closed with exception", ws.exception())

    except Exception as e:
        print(f"[WS] exception user={user_id}: {e}")
    finally:
        print(f"[WS] disconnect user={user_id}")
        await ws.close()

    return ws

# just added this function
connected_clients = {}  # Dict[str, Set[WebSocket]]
app = web.Application()
app.add_routes(routes)

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: web.WebSocketResponse):
#     await websocket.accept()
#     user_id = websocket.query_params.get("user")
#     room_id = websocket.query_params.get("room")  # If you use rooms
#     if room_id not in connected_clients:
#         connected_clients[room_id] = set()
#     connected_clients[room_id].add(websocket)
    
#     try:
#         while True:
#             data = await websocket.receive_bytes()
#             # Run emotion detection on frame
            
#             # Send back emotion result to the user who sent frame (as you already do)
#             await websocket.send_json({ ... })

#             # Broadcast the frame or emotion data to others in the room:
#             for client in connected_clients[room_id]:
#                 if client != websocket:
#                     # Option 1: Send raw frame bytes or a compressed image for others to show
#                     await client.send_bytes(data)  # or send_json with emotion data
                    
#                     # Option 2: Send emotion data of this user so others can update UI
#                     # await client.send_json({...})
                    
#     except WebSocketDisconnect:
#         connected_clients[room_id].remove(websocket)

def detect_safe(frame_bgr, user_id):
    """
    Threadpool safe wrapper that calls detect_emotion and updates the user's history.
    Expects frame_bgr as numpy BGR (possibly downscaled).
    Returns (label, conf, bbox) or None on error.
    """
    try:
        history = user_histories.setdefault(user_id, deque(maxlen=MAX_HISTORY))
        label, conf, bbox = detect_emotion(frame_bgr, history)  # detect_emotion appends to history
        return (label, conf, bbox)
    except Exception as e:
        print(f"[DETECT_ERR] user={user_id} err={e}")
        return None

# start STT thread (if available)
def start_stt_thread():
    if not stt_available:
        print("STT not available; skipping STT thread.")
        return
    print("Starting STT thread...")
    t = threading.Thread(target=run_engine, kwargs={"is_default_english": True, "v_th": 0.001}, daemon=True)
    t.start()

if __name__ == "__main__":
    start_stt_thread()
    print(f"Starting server at http://{HOST}:{PORT}")
    web.run_app(app, host=HOST, port=PORT)
