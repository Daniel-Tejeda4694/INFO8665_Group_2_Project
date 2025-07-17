from flask_cors import CORS
from flask import Flask, render_template_string, Response, request, redirect, url_for, jsonify
import cv2
import numpy as np
import threading
from collections import deque
from emotion_detector import detect_emotion_with_overlay
import logging
from datetime import datetime
import sys

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Or restrict to localhost:3000

###### LOG GENERATOR ######
# Set up logging to STDOUT (works with Docker logs)
access_logger = logging.getLogger('access_logger')
access_logger.setLevel(logging.INFO)
access_handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('%(message)s')
access_handler.setFormatter(formatter)
access_logger.addHandler(access_handler)
###### LOG GENERATOR ######

emotion_history = deque(maxlen=15)
camera_active = {"running": False}  # Use a mutable object to allow shared state

# HTML Template with Start/Stop buttons
HTML_PAGE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Parla Emotion Detection</title>
</head>
<body>
    <h1>🧠 Parla Real-Time Emotion Detection</h1>

    <form method="POST" action="/start">
        <button type="submit">Start Detection</button>
    </form>

    <form method="POST" action="/stop">
        <button type="submit">Stop Detection</button>
    </form>

    {% if running %}
        <p>Status: <strong style="color: green;">Running</strong></p>
        <img src="{{ url_for('video_feed') }}">
    {% else %}
        <p>Status: <strong style="color: red;">Stopped</strong></p>
    {% endif %}
</body>
</html>
'''


# @app.route('/')
# def index():
#     return render_template_string(HTML_PAGE, running=camera_active["running"])

# @app.route('/start', methods=['POST'])
# def start():
#     camera_active["running"] = True
#     return redirect(url_for('index'))

# @app.route('/stop', methods=['POST'])
# def stop():
#     camera_active["running"] = False
#     return redirect(url_for('index'))

# @app.route('/video_feed')
# def video_feed():
#     if camera_active["running"]:
#         return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
#     else:
#         return Response("", mimetype='text/plain')

# def gen_frames():
#     cap = cv2.VideoCapture(0)

#     while camera_active["running"]:
#         success, frame = cap.read()
#         if not success:
#             break

#         frame = detect_emotion_with_overlay(frame, emotion_history)

#         ret, buffer = cv2.imencode('.jpg', frame)
#         frame = buffer.tobytes()

#         yield (b'--frame\r\n'
#                 b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

#     cap.release()

user_frames = {}
user_locks = {}
user_history = {}

###### LOG GENERATOR ######
@app.after_request
def log_access(response):
    ip = request.remote_addr or "-"
    method = request.method
    resource = request.path
    status = response.status_code
    bytes_sent = response.calculate_content_length() or "-"
    referrer = request.referrer or "-"
    user_agent = request.user_agent.string
    timestamp = datetime.now().strftime('%d/%b/%Y:%H:%M:%S')

    log_line = f'{ip} - - [{timestamp}] "{method} {resource} HTTP/1.1" {status} {bytes_sent} "{referrer}" "{user_agent}"'
    access_logger.info(log_line)

    return response

###### LOG GENERATOR ######

@app.route('/upload_frame', methods=['POST'])
def upload_frame():
    user_id = request.args.get('user')
    if 'frame' not in request.files or not user_id:
        return "Missing frame or user", 400

    file = request.files['frame']
    data = file.read()
    print(f"Received frame for user: {user_id}, size: {len(data)} bytes")

    npimg = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if user_id not in user_locks:
        user_locks[user_id] = threading.Lock()
    if user_id not in user_history:
        user_history[user_id] = deque(maxlen=15)

    with user_locks[user_id]:
        user_frames[user_id] = frame

    return "OK", 200

@app.route('/video_feed')
def video_feed():
    user_id = request.args.get('user')
    if not user_id:
        return "Missing user", 400
    return Response(gen_user_frames(user_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


def gen_user_frames(user_id):
    while True:
        if user_id not in user_frames:
            continue
        # print(f"Streaming video for user: {user_id}")
        
        with user_locks[user_id]:
            frame = user_frames.get(user_id)
            if frame is None:
                continue

            frame = detect_emotion_with_overlay(frame, emotion_history)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
        
        if frame is None or frame.size == 0:
            print(f"[ERROR] Blank or invalid frame for user: {user_id}")
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


if __name__ == "__main__":
    # app.run(debug=True)
    app.run(debug=True, host="0.0.0.0", port=5000)
