import streamlit as st
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
from collections import deque, Counter
from PIL import Image
import time
import pandas as pd
import base64

# Load model and labels
model = load_model("./models/fer_vggnet_model.h5")
class_names = ['Angry', 'Happy', 'Neutral', 'Sad', 'Surprise']
emoji_path = "./emojis/"
mp_face = mp.solutions.face_detection

def main():
    # ------------------- Layout & Styling -------------------
    st.set_page_config(page_title="Parla", layout="centered")

    def get_base64_bg(path):
        with open(path, "rb") as f:
            data = f.read()
        return base64.b64encode(data).decode()

    bg_base64 = get_base64_bg("./extras/background_4.jpg")

    st.markdown(f"""
    <style>
        html, body {{
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
        }}

        .block-container {{
            min-height: 100vh;
            min-width: 100vw;
            padding-top: 2rem;
            padding-bottom: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)),
                        url("data:image/jpg;base64,{bg_base64}");
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
        }}

        img {{
            border-radius: 10px;
        }}
    </style>
    """, unsafe_allow_html=True)

    st.markdown("""
    <h1 style='text-align: center; color: #000000;'>🧠 Parla</h1>
    <h3 style='text-align: center; color: #888;'>Real-time Emotion Detection with AI</h3>
    <p style='text-align: center;'>Watch as your mood is recognized live! 🎥</p>
    """, unsafe_allow_html=True)

    # ------------------- Sidebar -------------------
    with st.sidebar:
        st.image("./extras/logo.png", width=200)
        st.header("🎛️ Controls")
        run = st.toggle("Start Camera")
        st.markdown("---")
        st.info("Ensure webcam access is allowed in your browser.")

    # ------------------- Frame Display -------------------
    frame_placeholder = st.empty()
    chart_placeholder = st.empty()

    # ------------------- Emotion Detection Setup -------------------
    emotion_history = deque(maxlen=15)
    emotion_log = {emotion: 0 for emotion in class_names}
    detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5)

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
                    emotion_log[final_label] += 1

                    # Draw bounding box and label
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    label_text = f"{final_label} ({conf * 100:.1f}%)"
                    cv2.putText(frame, label_text, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

                    # Draw emoji next to face
                    try:
                        emoji = Image.open(f"{emoji_path}{final_label}.png").convert("RGBA").resize((80, 80))
                        emoji_np = np.array(emoji)
                        emoji_rgb = emoji_np[:, :, :3]
                        alpha = emoji_np[:, :, 3] / 255.0
                        emoji_bgr = cv2.cvtColor(emoji_rgb, cv2.COLOR_RGB2BGR)
                        emoji_x = min(frame.shape[1] - 80, x2 + 10)
                        emoji_y = max(0, y1)

                        for c in range(3):
                            frame[emoji_y:emoji_y + 80, emoji_x:emoji_x + 80, c] = (
                                alpha * emoji_bgr[:, :, c] +
                                (1 - alpha) * frame[emoji_y:emoji_y + 80, emoji_x:emoji_x + 80, c]
                            )
                    except:
                        pass

            frame_placeholder.image(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), channels="RGB")

            # Live bar chart update
            df = pd.DataFrame.from_dict(emotion_log, orient='index', columns=['Count'])
            chart_placeholder.bar_chart(df)
            time.sleep(0.03)

        cap.release()

if __name__ == "__main__":
    main()