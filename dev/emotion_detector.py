# emotion_detector.py
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
from collections import Counter
from PIL import Image

model = load_model("training/fer_vggnet_model.h5")
class_names = ['Angry', 'Happy', 'Neutral', 'Sad', 'Surprise']
emoji_path = "documentation/emojis/"

SHOW_LABELS = False  # Set to True for testing later

mp_face = mp.solutions.face_detection
detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5)

def detect_emotion_with_overlay(frame, emotion_history):
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
                preds = model.predict(input_tensor)
                idx = np.argmax(preds)
                label = class_names[idx]
                conf = float(preds[0][idx])
                emotion_history.append(label)
            except:
                continue

            final_label = Counter(emotion_history).most_common(1)[0][0]

            if SHOW_LABELS:
                # Draw label and confidence
                label_text = f"{final_label} ({conf * 100:.1f}%)"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
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

    return frame
