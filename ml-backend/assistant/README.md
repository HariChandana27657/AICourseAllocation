# 🎙️ Course Allocation AI Assistant (Python)

Two modes: **Chat CLI** (text only) and **Voice Assistant** (speech in/out).

---

## 📁 Files

```
assistant/
├── chat_assistant.py   # Core AI logic — queries DB, generates responses
├── chat_cli.py         # Text-based terminal chat
├── voice_assistant.py  # Voice input (mic) + voice output (TTS)
├── requirements.txt    # Python dependencies
└── README.md
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
cd ml-backend/assistant
pip install -r requirements.txt
```

> **Windows PyAudio fix** (if pip install fails):
> ```bash
> pip install pipwin
> pipwin install pyaudio
> ```

### 2. Make sure the backend is running

```bash
cd backend
npm start
```

Backend must be on `http://localhost:5000`

---

## 🚀 Run

### Option A — Text Chat (no microphone needed)

```bash
cd ml-backend/assistant
python chat_cli.py
```

### Option B — Voice Assistant (microphone required)

```bash
cd ml-backend/assistant
python voice_assistant.py
```

---

## 🔑 Login Credentials

| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| Student | `hari@gmail.com`          | `231FA04H02`  |
| Student | `siva@gmail.com`          | `231FA04409`  |
| Student | `nikki@gmail.com`         | `231FA04C43`  |
| Student | `saru@gmail.com`          | `231FA04D96`  |
| Student | `KD@gmail.com`            | `student123`  |
| Admin   | `admin@university.edu`    | `admin123`    |

---

## 💬 What You Can Ask

| Question | Response |
|----------|----------|
| `Show available courses` | Lists all courses with seats & times |
| `My preferences` | Shows your submitted ranked preferences |
| `My results` | Shows your allocated courses |
| `How does allocation work?` | Explains the algorithm |
| `My GPA priority` | Shows your GPA and priority rank |
| `Deadline` | Shows preference submission deadline |
| `System stats` *(admin only)* | Shows total students, allocations etc. |
| `Help` | Lists all available commands |
| `Bye` | Exits the assistant |

---

## 🎙️ Voice Assistant Controls

| Action | How |
|--------|-----|
| Speak | Press **Enter** (blank input) then speak |
| Type instead | Just type your question and press Enter |
| Wake word | Say **"Hey Assistant"** followed by your question |
| Exit | Say or type **"bye"** / **"exit"** |

---

## 🔧 How It Works

```
User speaks/types
       ↓
SpeechRecognition (Google API) — converts speech to text
       ↓
ChatAssistant — queries SQLite DB directly for real data
       ↓
Response generated
       ↓
pyttsx3 TTS — converts text to speech (offline)
       ↓
User hears the answer
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `requests` | HTTP calls to backend API for login |
| `SpeechRecognition` | Converts microphone audio to text |
| `PyAudio` | Microphone access |
| `pyttsx3` | Offline text-to-speech (no API key) |
| `sqlite3` | Built-in Python — reads the database directly |

---

## 🛠️ Troubleshooting

**"No module named 'pyaudio'"**
```bash
# Windows
pip install pipwin && pipwin install pyaudio

# Linux
sudo apt-get install python3-pyaudio

# Mac
brew install portaudio && pip install pyaudio
```

**"Could not connect to backend"**
- Make sure `npm start` is running in the `backend/` folder
- Check that port 5000 is not blocked

**"Speech not recognized"**
- Check your microphone is connected and not muted
- Speak clearly and wait for the "Listening..." prompt
- Requires internet for Google Speech Recognition
