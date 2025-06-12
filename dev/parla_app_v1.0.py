import streamlit as st
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
from collections import deque, Counter
from PIL import Image
import time

# Load model
model = load_model("./models/fer_vggnet_model.h5")
class_names = ['Angry', 'Happy', 'Neutral', 'Sad', 'Surprise']
emoji_path = "./emojis/"
mp_face = mp.solutions.face_detection


# Page layout
st.set_page_config(page_title="Parla", layout="centered")
st.title("🧠 Parla: Real-time Emotion Detection")
st.markdown("Detects facial emotions using your webcam. Watch as your mood is recognized live!")

# 🟢 FIXED TOGGLE POSITION — Always visible at top
run = st.toggle("Start Camera")

# Frame display placeholder
frame_placeholder = st.empty()

# Emotion detection setup
emotion_history = deque(maxlen=10)
detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5)

# Detection logic
if run:
    cap = cv2.VideoCapture(0)
    while run:
        ret, frame = cap.read()
        if not ret:
            st.warning("Webcam not accessible.")
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = detector.process(rgb)

        if results.detections:
            for detection in results.detections:
                bbox = detection.location_data.relative_bounding_box
                h, w, _ = frame.shape
                x = int(bbox.xmin * w)
                y = int(bbox.ymin * h)
                box_w = int(bbox.width * w)
                box_h = int(bbox.height * h)
                x1, y1 = max(0, x), max(0, y)
                x2, y2 = min(w, x + box_w), min(h, y + box_h)

                face_roi = frame[y1:y2, x1:x2]
                try:
                    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
                    resized = cv2.resize(gray, (48, 48)) / 255.0
                    input_tensor = np.expand_dims(resized, axis=(0, -1))
                except:
                    continue

                preds = model.predict(input_tensor)
                idx = np.argmax(preds)
                label = class_names[idx]
                conf = float(preds[0][idx])
                emotion_history.append(label)
                final_label = Counter(emotion_history).most_common(1)[0][0]

                # Draw bounding box and text
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label_text = f"{final_label} ({conf * 100:.1f}%)"
                cv2.putText(frame, label_text, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

                # Draw emoji next to bounding box
                try:
                    # Load emoji and resize
                    emoji = Image.open(f"{emoji_path}{final_label}.png").convert("RGBA").resize((80, 80))
                    emoji_np = np.array(emoji)

                    # Split channels
                    emoji_rgb = emoji_np[:, :, :3]
                    alpha = emoji_np[:, :, 3] / 255.0

                    # ✅ Convert RGB → BGR for OpenCV
                    emoji_bgr = cv2.cvtColor(emoji_rgb, cv2.COLOR_RGB2BGR)

                    # Position emoji near face
                    emoji_x = min(frame.shape[1] - 80, x2 + 10)
                    emoji_y = max(0, y1)

                    # Overlay emoji using alpha blending
                    for c in range(3):
                        frame[emoji_y:emoji_y + 80, emoji_x:emoji_x + 80, c] = (
                            alpha * emoji_bgr[:, :, c] +
                            (1 - alpha) * frame[emoji_y:emoji_y + 80, emoji_x:emoji_x + 80, c]
                        )
                except Exception as e:
                    print("Emoji overlay failed:", e)


        frame_placeholder.image(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), channels="RGB")
        time.sleep(0.03)

    cap.release()
