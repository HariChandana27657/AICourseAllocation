"""
Voice Assistant for Course Allocation System
Uses SpeechRecognition + pyttsx3 (offline TTS) or gTTS (online TTS)
"""

import speech_recognition as sr
import pyttsx3
import threading
import time
import sys
from chat_assistant import CourseAllocationChatAssistant

# ── TTS Engine ────────────────────────────────────────────────────────────────

class TTSEngine:
    """Text-to-Speech using pyttsx3 (offline, no API key needed)."""

    def __init__(self):
        self.engine = pyttsx3.init()
        self._configure()

    def _configure(self):
        self.engine.setProperty("rate", 165)      # speaking speed
        self.engine.setProperty("volume", 0.95)   # volume 0-1
        # Try to pick a natural English voice
        voices = self.engine.getProperty("voices")
        for v in voices:
            if "english" in v.name.lower() or "en_" in v.id.lower():
                self.engine.setProperty("voice", v.id)
                break

    def speak(self, text: str):
        """Speak text synchronously."""
        # Strip markdown for cleaner speech
        clean = text.replace("**", "").replace("*", "").replace("  ", " ")
        print(f"\n🔊 Assistant: {text}\n")
        self.engine.say(clean)
        self.engine.runAndWait()

    def stop(self):
        self.engine.stop()


# ── Speech Recognition ────────────────────────────────────────────────────────

class SpeechListener:
    """Listens to microphone and returns transcribed text."""

    WAKE_WORDS = ["hey assistant", "hello assistant", "hi assistant", "ok assistant"]

    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8

    def listen_once(self, timeout: int = 8, phrase_limit: int = 15) -> str:
        """Listen for a single utterance and return transcript."""
        with sr.Microphone() as source:
            print("🎤 Listening... (speak now)")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            try:
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_limit)
                text = self.recognizer.recognize_google(audio, language="en-IN")
                print(f"📝 You said: {text}")
                return text.strip()
            except sr.WaitTimeoutError:
                return ""
            except sr.UnknownValueError:
                return ""
            except sr.RequestError as e:
                print(f"⚠️  Speech recognition error: {e}")
                return ""

    def strip_wake_word(self, text: str) -> str:
        """Remove wake word prefix from transcript."""
        lower = text.lower()
        for w in self.WAKE_WORDS:
            if lower.startswith(w):
                return text[len(w):].strip()
        return text


# ── Voice Assistant ───────────────────────────────────────────────────────────

class VoiceAssistant:
    """
    Full voice assistant combining speech recognition, chat AI, and TTS.
    """

    def __init__(self):
        self.chat = CourseAllocationChatAssistant()
        self.tts = TTSEngine()
        self.listener = SpeechListener()
        self.running = False

    def _print_banner(self):
        print("\n" + "═" * 60)
        print("  🎙️  Course Allocation Voice Assistant")
        print("  Powered by SpeechRecognition + pyttsx3")
        print("═" * 60)
        print("  Commands:")
        print("    • Speak naturally after the prompt")
        print("    • Say 'bye' or 'exit' to quit")
        print("    • Say 'Hey Assistant <question>' anytime")
        print("═" * 60 + "\n")

    def login_flow(self) -> bool:
        """Interactive login via voice or keyboard."""
        self.tts.speak("Welcome to the Course Allocation Voice Assistant. Please log in.")
        print("\n" + "─" * 40)
        print("Login (type your credentials)")
        print("─" * 40)

        role = input("Role (student/admin) [student]: ").strip().lower() or "student"
        email = input("Email: ").strip()
        password = input("Password: ").strip()

        if self.chat.login(email, password, role):
            self.tts.speak(f"Welcome, {self.chat.user['name']}! How can I help you today?")
            return True
        else:
            self.tts.speak("Login failed. Please check your credentials and try again.")
            return False

    def run(self):
        """Main voice assistant loop."""
        self._print_banner()

        if not self.login_flow():
            return

        self.running = True
        self.tts.speak(
            "I'm ready. You can ask me about courses, preferences, results, or anything about the allocation system."
        )

        while self.running:
            print("\n" + "─" * 40)
            print("🎤 Tap ENTER to speak, or type your question:")
            print("─" * 40)

            user_input = input(">> ").strip()

            # If user just pressed Enter, use voice input
            if user_input == "":
                user_input = self.listener.listen_once()
                if not user_input:
                    self.tts.speak("I didn't catch that. Please try again.")
                    continue

            # Strip wake word
            user_input = self.listener.strip_wake_word(user_input)

            # Exit commands
            if user_input.lower() in ["bye", "exit", "quit", "goodbye"]:
                self.tts.speak("Goodbye! Good luck with your course selection.")
                self.running = False
                break

            # Get and speak response
            response = self.chat.get_response(user_input)
            self.tts.speak(response)


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    assistant = VoiceAssistant()
    assistant.run()
