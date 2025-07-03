from flask import Flask, render_template_string, Response, request, redirect, url_for
import cv2
from collections import deque
from emotion_detector import detect_emotion_with_overlay

app = Flask(__name__)
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

@app.route('/')
def index():
    return render_template_string(HTML_PAGE, running=camera_active["running"])

@app.route('/start', methods=['POST'])
def start():
    camera_active["running"] = True
    return redirect(url_for('index'))

@app.route('/stop', methods=['POST'])
def stop():
    camera_active["running"] = False
    return redirect(url_for('index'))

@app.route('/video_feed')
def video_feed():
    if camera_active["running"]:
        return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    else:
        return Response("", mimetype='text/plain')

def gen_frames():
    cap = cv2.VideoCapture(0)

    while camera_active["running"]:
        success, frame = cap.read()
        if not success:
            break

        frame = detect_emotion_with_overlay(frame, emotion_history)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()

if __name__ == "__main__":
    app.run(debug=True)
