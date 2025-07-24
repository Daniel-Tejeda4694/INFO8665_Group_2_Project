# Whisper Speech-to-Text Engine
This module provides a real-time streaming speech-to-text system using OpenAI Whisper. It records audio from a microphone and transcribes it in near real-time using multithreaded processing.

## File: `whisper_engine.py`
### Features
- Real-time transcription using OpenAI Whisper

- Supports different Whisper model sizes (e.g., tiny, base, small, medium, large)

- Threaded architecture: audio collection and transcription run in parallel

- Language support (e.g., zh, en, ro, es, etc.)

## Installation
1. Create a virtual environment 
``` bash
conda create -n whisper-env python=3.11.13
conda activate whisper-env
```

2. Install dependencies
Create requirements.txt with the following content:
``` txt
sounddevice==0.5.2
numpy==2.0.1
scipy==1.15.3
whisper==20250625
```
Install with:
``` bash
pip install -r requirements.txt
```

If whisper==20250625 does not exist on PyPI, install it from GitHub instead:
``` bash
pip install git+https://github.com/openai/whisper.git
```

## Usage
Run the main script:
``` bash
python whisper_engine.py
```
When prompted, enter a supported language (case-insensitive):
``` sql
Please enter a language (chinese / romanian / spanish / malayalam / telugu / english):
Language: chinese
```
The program will start real-time speech transcription using the corresponding Whisper language code.

## Output Files
Transcription results are saved under the output/ directory:

1. latest.txt
    - This file stores the most recent real-time transcription segment.
    - It is continuously updated during runtime and can be used for UI display or monitoring.

2. transcript_stream_YYYYMMDD-HHMMSS.txt
    - These files store complete transcription sessions, with a timestamp in the filename.
    - A new file is created for each session and contains the full text output from that run.
    ``` pqsql
    Example:
    output/
    ├── latest.txt                      ← real-time streaming output
    └── transcript_stream_20250723-141443.txt ← full transcript from session
    ```

## Supported Languages
| Language Input | Whisper Code |
| -------------- | ------------ |
| chinese        | zh           |
| romanian       | ro           |
| spanish        | es           |
| malayalam      | ml           |
| telugu         | te           |
| english        | en           |
If you enter an unsupported language, the program will exit and ask you to try again.

## Code Structure
| Component             | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `WhisperRecognizer`   | Core class that handles audio recording and Whisper transcription |
| `audio_stream()`      | Records audio and feeds to a queue                                |
| `transcribe_stream()` | Transcribes audio in queue using Whisper                          |
| `streaming_mode()`    | Starts two threads for audio and transcription                    |

## Notes
This module uses sounddevice to access microphone input.
It runs in real time and prints transcriptions every 3 seconds (or defined CHUNK_DURATION).
Default sample rate is 16000 Hz.

## License
This project uses OpenAI Whisper and is distributed under the MIT License.
