# emotion_detector.py
import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from collections import Counter
from PIL import Image
from datetime import datetime, timezone

# TFLite setup (same as before)
interpreter = tf.lite.Interpreter(model_path="../training/fer_vggnet_float16_quantized.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

class_names = ['Angry', 'Happy', 'Neutral', 'Sad', 'Surprise']
emoji_path = "../documentation/emojis/"

SHOW_LABELS = False

mp_face = mp.solutions.face_detection
detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5)

def _predict_emotion_on_face(face_roi):
    """
    Run the TFLite model on a face ROI (BGR region). Returns (label, conf).
    """
    try:
        gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (48, 48)) / 255.0
        input_tensor = np.expand_dims(resized, axis=(0, -1)).astype(np.float32)
        interpreter.set_tensor(input_details[0]['index'], input_tensor)
        interpreter.invoke()
        preds = interpreter.get_tensor(output_details[0]['index'])
        idx = int(np.argmax(preds))
        label = class_names[idx]
        conf = float(preds[0][idx])
        return label, conf
    except Exception:
        return None, 0.0

def detect_emotion_with_overlay(frame, emotion_history):
    """
    Legacy function — draws overlays/emojis on frame and returns full frame.
    Keeps behavior unchanged.
    """
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = detector.process(rgb)

    detected_emotion = None

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
                label, conf = _predict_emotion_on_face(face_roi)
                if label:
                    emotion_history.append(label)
            except:
                continue

            final_label = Counter(emotion_history).most_common(1)[0][0]
            detected_emotion = final_label  # Capture detected emotion

            if SHOW_LABELS:
                label_text = f"{final_label} ({conf * 100:.1f}%)"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label_text, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # emoji overlay
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
            except Exception as e:
                print(f"Failed to overlay emoji for '{final_label}': {e}")

    return frame

def detect_emotion(frame, emotion_history):
    """
    New function: analyze the frame, update emotion_history, and return single best label + conf + bbox.
    frame: numpy BGR image (can be downscaled)
    emotion_history: deque to append label to
    Returns: (label, conf, bbox) where bbox = (x1, y1, x2, y2) in frame coordinates, or (None,0,None).
    """
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = detector.process(rgb)
    if not results.detections:
        return (None, 0.0, None)

    # For simplicity pick the largest detection (if multiple faces)
    best = None
    best_area = 0
    h, w, _ = frame.shape

    for detection in results.detections:
        bb = detection.location_data.relative_bounding_box
        x = int(bb.xmin * w)
        y = int(bb.ymin * h)
        box_w = int(bb.width * w)
        box_h = int(bb.height * h)
        x1, y1 = max(0, x), max(0, y)
        x2, y2 = min(w, x + box_w), min(h, y + box_h)
        area = (x2 - x1) * (y2 - y1)
        if area > best_area:
            best_area = area
            best = (x1, y1, x2, y2)

    if best is None:
        return (None, 0.0, None)

    x1, y1, x2, y2 = best
    face_roi = frame[y1:y2, x1:x2]
    label, conf = _predict_emotion_on_face(face_roi)
    if label:
        emotion_history.append(label)
    # compute final label from history (smoothing)
    if len(emotion_history) == 0:
        final_label = label or None
    else:
        final_label = Counter(emotion_history).most_common(1)[0][0]
    # We return the bbox of the face where we predicted; client will map normalized coords to its video size.
    return (final_label, conf, (x1, y1, x2, y2))
