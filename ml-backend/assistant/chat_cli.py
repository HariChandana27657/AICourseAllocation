"""
Text Chat CLI for Course Allocation System
Run this for a terminal-based chat experience (no microphone needed)
"""

import sys
import os
from datetime import datetime
from chat_assistant import CourseAllocationChatAssistant


def print_banner():
    print("\n" + "═" * 60)
    print("  💬  Course Allocation Chat Assistant")
    print("  Connected to: http://localhost:5000")
    print("═" * 60)
    print("  Type your question and press Enter")
    print("  Type 'bye' or 'exit' to quit")
    print("  Type 'history' to see conversation history")
    print("  Type 'clear' to clear the screen")
    print("═" * 60 + "\n")


def print_message(role: str, text: str):
    time_str = datetime.now().strftime("%H:%M")
    if role == "user":
        print(f"\n  🧑 You [{time_str}]:")
        print(f"  {text}")
    else:
        print(f"\n  🤖 Assistant [{time_str}]:")
        for line in text.split("\n"):
            print(f"  {line}")


def login_flow(chat: CourseAllocationChatAssistant) -> bool:
    print("─" * 40)
    print("  Login to Course Allocation System")
    print("─" * 40)

    role = input("  Role (student/admin) [student]: ").strip().lower() or "student"
    email = input("  Email: ").strip()
    password = input("  Password: ").strip()
    print()

    return chat.login(email, password, role)


def show_history(chat: CourseAllocationChatAssistant):
    if not chat.history:
        print("\n  📭 No conversation history yet.\n")
        return
    print("\n  📜 Conversation History:")
    print("  " + "─" * 40)
    for msg in chat.history:
        icon = "🧑" if msg["role"] == "user" else "🤖"
        print(f"  {icon} [{msg['time']}] {msg['text'][:80]}{'...' if len(msg['text']) > 80 else ''}")
    print()


def main():
    print_banner()

    chat = CourseAllocationChatAssistant()

    if not login_flow(chat):
        print("\n  ❌ Login failed. Exiting.\n")
        sys.exit(1)

    print_message("assistant", chat.get_response("hello"))

    while True:
        try:
            user_input = input("\n  You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n  👋 Goodbye!\n")
            break

        if not user_input:
            continue

        if user_input.lower() in ["bye", "exit", "quit"]:
            response = chat.get_response("bye")
            print_message("assistant", response)
            break

        if user_input.lower() == "history":
            show_history(chat)
            continue

        if user_input.lower() == "clear":
            os.system("cls" if os.name == "nt" else "clear")
            print_banner()
            continue

        response = chat.get_response(user_input)
        print_message("assistant", response)

    print()


if __name__ == "__main__":
    main()
