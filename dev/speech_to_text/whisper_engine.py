### translingo/stt_engine/whisper_engine.py
import os
os.environ['FOR_DISABLE_CONSOLE_CTRL_HANDLER'] = '1'
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import whisper
import queue
import threading
import time

class WhisperRecognizer:
    def __init__(self, isPipeline=False, default_model_size="base", lan="zh", select_default_model_size=True):
        self.SAMPLE_RATE = 16000
        self.CHUNK_DURATION = 3
        self.CHUNK_SIZE = int(self.SAMPLE_RATE * self.CHUNK_DURATION)
        self.OVERLAP = 0#.5
        self.audio_q = queue.Queue(maxsize=40)
        self.lan = lan
        self.default_model_size = default_model_size
        if isPipeline: # For CI/CD
            self.model = whisper.load_model(self.default_model_size)
        elif select_default_model_size==True: # Select default model size
            self.model = self.load_selected_model(is_default_size=True)
        else: # Manually select model size
            self.model = self.load_selected_model()
        self.transcripts = []
        self.last_text = ""
        self.display_mic_info()
        self.running = True
        self.output_dir = "output"
        self.output_tempfile = "latest.txt"

    def test_input_devices(self):
        for i, dev in enumerate(sd.query_devices()):
            if dev['max_input_channels'] > 0:
                print(f"Testing input device {i}: {dev['name']}")
                try:
                    duration = 1  # seconds
                    fs = 16000
                    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16', device=i)
                    sd.wait()
                    if np.any(audio):
                        print(f"✅ Device {i} picked up sound.")
                    else:
                        print(f"⚠️ Device {i} recorded silence.")
                except Exception as e:
                    print(f"❌ Device {i} error: {e}")

    def display_mic_info(self):
        print("Default input device:", sd.default.device)
        print(sd.query_devices())
        return

    def run_pipeline_mode(self):
        audio_path = "audio_samples/sample_for_pipeline.flac"
        output_path = self.output_dir+"/transcript_for_pipeline.txt"

        print("Loading Whisper model...")
        model = whisper.load_model("base")

        print(f"Transcribing: {audio_path}")
        result = model.transcribe(audio_path, fp16=False)

        os.makedirs(self.output_dir, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result["text"])

        print("Transcription result:")
        print(result["text"])
        print(f"Saved to {output_path}")

    def load_selected_model(self, is_default_size=False):
        if is_default_size:
            model_size = self.default_model_size
        else:
            print("Select Whisper model size:")
            print("1. tiny       # 39M")
            print("2. base       # 74M")
            print("3. small      # 244M")
            print("4. medium     # 769M")
            print("5. large      # 1550M, highest accuracy")
            print("6. turbo     # 809M, fastest speed")
            # print("7. tiny.en    # 39M")
            # print("8. base.en    # 74M")
            # print("9. small.en   # 244M")
            # print("10. medium.en  # 769M")
            model_choices = {
                "1": "tiny", "2": "base", "3": "small", "4": "medium", "5": "large",
                "6": "turbo", "7": "tiny.en", "8": "base.en", "9": "small.en", "10": "medium.en"
            }
            choice = input("Enter 1–6: ").strip()
            model_size = model_choices.get(choice, "base")

        model_dir = os.path.join("models", "whisper")
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, f"{model_size}.pt")

        if os.path.isfile(model_path):
            print(f"Loading cached model from {model_path}...")
        else:
            print(f"Downloading model '{model_size}' to {model_path}...")

        return whisper.load_model(model_size, download_root=model_dir) # load_model() will not re-download the model if it already exists


    def record_audio(self, duration):
        print(f"Recording {duration} seconds...")
        sd.check_input_settings(device=3, channels=1, samplerate=16000, dtype='int16')
        audio = sd.rec(
            int(duration * self.SAMPLE_RATE), 
            samplerate=self.SAMPLE_RATE, 
            channels=1, 
            dtype='int16',
            device=3
            )
        
        sd.wait()
        print("Recording finished.")
        print("First few samples:", audio[:10].flatten())
        if np.all(audio == 0):
            print("Warning: All audio samples are 0 — no sound was recorded.")
        else:
            print("Audio contains non-zero values.")
        return audio

    def save_wav(self, audio_data, filename):
        wav.write(filename, self.SAMPLE_RATE, audio_data)
        print(f"Audio saved to: {filename}")

    def save_transcript(self, text, tag="output"):
        os.makedirs(self.output_dir, exist_ok=True)
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        output_path = os.path.join(self.output_dir, f"transcript_{tag}_{timestamp}.txt")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Transcript saved to: {output_path}")

    def transcribe_audio(self, filename):
        print("Transcribing audio...")
        result = self.model.transcribe(filename, fp16=False, language=self.lan)
        print("Transcription:")
        print(result["text"])
        self.save_transcript(result["text"], tag="manual")

    def audio_stream(self):
        """
        Starts an audio input stream that continuously records microphone input.
        Captured audio chunks are sent to a queue for real-time transcription.
        """

        def callback(indata, frames, time_info, status):
            """
            This callback is triggered whenever a new audio block is captured.
            It copies the audio data and places it into the queue for processing.
            """
            if status:
                print("Status:", status)
            self.audio_q.put(indata.copy()) # add a block data

        """
        Opens a real-time audio input stream using sounddevice.
        Continuously captures audio in blocks and triggers the callback function.
        """
        with sd.InputStream(
                channels=1,
                blocksize=8000, #16000,
                samplerate=self.SAMPLE_RATE,
                dtype='int16',
                callback=callback):
            while self.running:
                """
                The InputStream runs in non-blocking mode, meaning it records audio in the background and sends data to the callback function.
                The while True: sd.sleep(100) loop keeps the program running, so the stream stays open and continues capturing audio.
                """
                sd.sleep(100)
        print(f">>Turn off: audio_stream.")
        return

    def transcribe_stream(self):
        buffer = np.zeros((0, 1), dtype='int16')

        while self.running:
            try:
                chunk = self.audio_q.get(timeout=0.5)
                self.audio_q.task_done()  # Mark queue getting task as done
            except queue.Empty:
                continue
            buffer = np.concatenate((buffer, chunk), axis=0)

            if len(buffer) >= self.CHUNK_SIZE:
                segment = buffer[:self.CHUNK_SIZE]
                head = self.CHUNK_SIZE * (1 - self.OVERLAP)
                buffer = buffer[head:]

                # Make transcribe 
                audio = segment.astype(np.float32) / 32768.0
                audio = audio.flatten()
                result = self.model.transcribe(audio, fp16=False, language=self.lan)
                new_text = result["text"]

                print(">>", new_text)
                self.transcripts.append(new_text)

                # Save to output_tempfile
                os.makedirs(self.output_dir, exist_ok=True)
                latest_file = os.path.join(self.output_dir, self.output_tempfile)
                with open(latest_file, "w", encoding="utf-8") as f:
                    f.write(new_text)
                sd.sleep(100)

        full_text = "\n".join(self.transcripts)
        self.save_transcript(full_text, tag="stream")
        print(f">>Turn off: transcribe_stream.")
        return
    def streaming_mode(self):
        print("Starting real-time transcription (Ctrl+C to stop)...")
        thread_audio = threading.Thread(target=self.audio_stream, daemon=True)
        thread_transcribe = threading.Thread(target=self.transcribe_stream, daemon=True)

        thread_audio.start()
        thread_transcribe.start()

        try:
            while self.running:
                time.sleep(1)
                if input("Press q to stop...\n") == 'q':
                    print("Stopping...")
                    self.running = False
                    break
                time.sleep(0.1)
        except KeyboardInterrupt:
            print("Ctrl+C detected. Stopping...")
            self.running = False

        thread_audio.join()
        thread_transcribe.join()
        print("All threads stopped.")

if __name__ == "__main__":
    """
    Language list supported by whisper could be found in https://github.com/openai/whisper/blob/main/whisper/tokenizer.py.
    """
    supported_langs = {
        "chinese": "zh",
        "romanian": "ro",
        "spanish": "es",
        "malayalam": "ml",
        "telugu": "te",
        "english": "en"
    }

    print("Please enter a language (chinese / romanian / spanish / malayalam / telugu / english):")
    user_input = input("Language: ").strip().lower()

    if user_input in supported_langs:
        lan_code = supported_langs[user_input]
        whiRecognizer = WhisperRecognizer(lan=lan_code)
        whiRecognizer.streaming_mode()
    else:
        print("Unsupported language. Please re-run and enter a valid option.")