FROM python:3.9-slim

WORKDIR /app

COPY dev/flask_app.py dev/emotion_detector.py /app/
COPY training/fer_vggnet_float16_quantized.tflite /app/training/fer_vggnet_float16_quantized.tflite
COPY documentation/emojis /app/documentation/emojis
COPY documentation/setup/requirements_backend.txt /app/requirements_backend.txt

# ============ PYTHON BACKEND SETUP =============
# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv libgl1 libglib2.0-0 \
    && pip3 install --upgrade pip \
    && pip3 install -r requirements_backend.txt \
    && rm -rf /var/lib/apt/lists/*

# Expose Flask backend port
EXPOSE 5000

# Start the Flask backend (adjust if your app has different entrypoint)
CMD ["python3", "flask_app.py"]