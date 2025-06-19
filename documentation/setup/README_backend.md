# 🧠 Parla: Real-Time Emotion Recognition API (Flask Backend)

This project implements the **backend service** for *Parla*, a real-time facial emotion recognition system using a VGG-inspired CNN model. The Flask API streams live webcam input, detects faces using MediaPipe, and overlays emotion-specific emojis on the video feed.

---

## 🚀 Key Features

- 🔍 Real-time **face detection** using MediaPipe
- 🧠 Emotion classification with **VGG-style CNN** trained on FER-2013
- 😊 Emoji overlay for five emotion classes: Angry, Happy, Neutral, Sad, Surprise
- ♻️ Stabilized predictions using historical emotion buffer
- 🔧 Toggleable display of confidence score and bounding boxes

---

## 📁 Project Structure

```
├── flask_app.py              # Main Flask app
├── emotion_detector.py       # Emotion detection logic with overlay
├── training/
│   └── fer_vggnet_model.h5   # Pretrained CNN model (required)
├── documentation/
│   └── emojis/               # PNG emoji files for overlay
```

---

## ⚙️ Setup Environment

Install dependencies (file in `documentation/setup` directory)

```bash
pip install -r requirements_backend.txt
```

**Requirements:**

- Python 3.10 (recommended)
- OpenCV
- NumPy, Pandas
- Pillow
- MediaPipe

---

## 🏁 Running the Server

Run the Flask app:

```bash
python flask_app.py
```

Then open your browser and navigate to:

```
http://127.0.0.1:5000/
```

You can control the detection via the **Start** and **Stop** buttons.

---

## 🎯 Emotion Classes

The backend supports five emotion classes:

| Emotion   | Emoji    |
|-----------|----------|
| Angry     | 😠        |
| Happy     | 😀        |
| Neutral   | 😐        |
| Sad       | 😢        |
| Surprise  | 😮        |

_Disgust and Fear were removed during preprocessing._

---

## 🖼️ Output Example

When active, the app streams live video with:

- Detected **emotions overlaid as emojis**
- (Optional) Labels and bounding boxes (set `SHOW_LABELS = True` in `emotion_detector.py`)

---

## 🛠️ Customization

To display the emotion labels and confidence score, open `emotion_detector.py` and set:

```python
SHOW_LABELS = True
```

---

## 📌 Notes

- Detection stability is improved by using a `deque` buffer of the 15 most recent predictions.

---

## 📚 Acknowledgements

- MediaPipe by Google for face detection
- Emoji icons used from [FLATICON](https://www.flaticon.com/)

---

## 📝 License

This backend is provided for educational and research use. Commercial use requires explicit permission.
