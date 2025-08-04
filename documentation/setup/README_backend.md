# 🧠 Parla: Real-Time Emotion and Speech Recognition API (Flask Backend)

This project implements the **backend service** for Parla, a real-time facial emotion recognition and speech-to-text system. It features a VGG-inspired CNN model for emotion classification, integrated into a Flask API that streams live webcam input, detects faces using MediaPipe, and overlays emotion-specific emojis on the video feed. Additionally, this module provides a real-time streaming speech-to-text system using OpenAI Whisper. It records audio from a microphone and transcribes it in near real-time using multithreaded processing.

---

## 🚀 Key Features

- 🔍 Real-time **face detection** using MediaPipe
- 🧠 Emotion classification with **VGG-style CNN** trained on FER-2013
- 😊 Emoji overlay for five emotion classes: Angry, Happy, Neutral, Sad, Surprise
- ♻️ Stabilized predictions using historical emotion buffer
- 🔧 Toggleable display of confidence score and bounding boxes
- 🎙️ Real-time **speech-to-text transcription** using OpenAI Whisper  
- 🧩 Supports multiple Whisper model sizes (e.g., *tiny*, *base*, *small*, *medium*, *large*)  
- 🧵 **Threaded architecture**: audio recording and transcription run in parallel  
- 🌐 **Multilingual support** (e.g., *zh*, *en*, *ro*, *es*, etc.)

---

## 📁 Project Structure

```
├── flask_app.py              # Main Flask app
├── emotion_detector.py       # Emotion detection logic with overlay
├── training/
│   └── fer_vggnet_model.h5   # Pretrained CNN model (required)
├── documentation/
│   └── emojis/               # PNG emoji files for overlay
├── speech_to_text/
│   └── whisper_engine.py     # Real time speech-to-text
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

Install Whisper and other required dependencies in the following order (recommended with --no-deps to avoid dependency conflicts).
``` bash
# Install Whisper from GitHub
pip install git+https://github.com/openai/whisper.git --no-deps

# Install required dependencies
pip install torch --no-deps
pip install tqdm --no-deps 
pip install tiktoken --no-deps
pip install regex --no-deps
```

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
