"""
Chat Assistant for Course Allocation System
Connects to the Node.js backend API and provides intelligent responses
"""

import requests
import json
import sqlite3
import os
from datetime import datetime
from typing import Optional, Dict, Any

# ── Config ──────────────────────────────────────────────────────────────────
BACKEND_URL = "http://localhost:5000/api"
DB_PATH = os.path.join(os.path.dirname(__file__), "../../backend/course_allocation.db")


class CourseAllocationChatAssistant:
    """
    Intelligent chat assistant for the Course Allocation System.
    Queries the SQLite database directly for fast, accurate responses.
    """

    def __init__(self):
        self.token: Optional[str] = None
        self.user: Optional[Dict] = None
        self.history: list = []
        self.db_path = os.path.abspath(DB_PATH)

    # ── Auth ─────────────────────────────────────────────────────────────────

    def login(self, email: str, password: str, role: str = "student") -> bool:
        """Login to the system and store JWT token."""
        try:
            endpoint = f"{BACKEND_URL}/auth/{role}/login"
            res = requests.post(endpoint, json={"email": email, "password": password}, timeout=5)
            if res.status_code == 200:
                data = res.json()
                self.token = data["token"]
                self.user = data["user"]
                print(f"\n✅ Logged in as {self.user['name']} ({role})")
                return True
            else:
                print(f"\n❌ Login failed: {res.json().get('error', 'Unknown error')}")
                return False
        except requests.exceptions.ConnectionError:
            print("\n❌ Cannot connect to backend. Make sure the server is running on port 5000.")
            return False

    def _headers(self) -> Dict:
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}

    # ── DB helpers ────────────────────────────────────────────────────────────

    def _db_query(self, sql: str, params: tuple = ()) -> list:
        """Run a read query against the SQLite database."""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute(sql, params)
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return rows
        except Exception as e:
            return []

    # ── Response Engine ───────────────────────────────────────────────────────

    def get_response(self, message: str) -> str:
        """Generate a response to the user's message."""
        msg = message.lower().strip()
        self.history.append({"role": "user", "text": message, "time": datetime.now().strftime("%H:%M")})

        response = self._route_message(msg)
        self.history.append({"role": "assistant", "text": response, "time": datetime.now().strftime("%H:%M")})
        return response

    def _route_message(self, msg: str) -> str:
        # Greetings
        if any(w in msg for w in ["hello", "hi", "hey", "good morning", "good afternoon"]):
            name = self.user["name"] if self.user else "there"
            return (
                f"Hello {name}! 👋 I'm your Course Allocation Assistant.\n\n"
                "I can help you with:\n"
                "  📚 Available courses\n"
                "  📝 Submitting preferences\n"
                "  🎯 Allocation results\n"
                "  📊 GPA and priority info\n"
                "  ⚙️  How the algorithm works\n\n"
                "What would you like to know?"
            )

        # Courses
        if any(w in msg for w in ["course", "subject", "class", "available", "list"]):
            return self._courses_response()

        # Preferences
        if any(w in msg for w in ["preference", "submit", "rank", "choose", "select"]):
            return self._preferences_response()

        # Results / Allocation
        if any(w in msg for w in ["result", "allocat", "assign", "enroll", "my course", "schedule"]):
            return self._results_response()

        # GPA
        if any(w in msg for w in ["gpa", "grade", "priority", "score", "cgpa"]):
            return self._gpa_response()

        # Algorithm
        if any(w in msg for w in ["how", "algorithm", "work", "process", "system"]):
            return self._algorithm_response()

        # Deadline
        if any(w in msg for w in ["deadline", "when", "date", "last date", "expire"]):
            return self._deadline_response()

        # Students (admin)
        if self.user and self.user.get("role") == "admin":
            if any(w in msg for w in ["student", "total", "stat", "overview", "report"]):
                return self._admin_stats_response()

        # Help
        if any(w in msg for w in ["help", "support", "what can", "assist"]):
            return self._help_response()

        # Farewell
        if any(w in msg for w in ["bye", "goodbye", "exit", "quit", "thanks", "thank you"]):
            return "👋 Goodbye! Good luck with your course selection. Come back anytime!"

        # Fallback
        return (
            "🤔 I'm not sure about that. Here are some things I can help with:\n\n"
            "  • 'Show available courses'\n"
            "  • 'How to submit preferences'\n"
            "  • 'Check my results'\n"
            "  • 'How does allocation work?'\n"
            "  • 'What is my GPA priority?'"
        )

    # ── Response Builders ─────────────────────────────────────────────────────

    def _courses_response(self) -> str:
        courses = self._db_query(
            "SELECT course_code, course_name, department, instructor, seat_capacity, enrolled_count, time_slot FROM courses ORDER BY department"
        )
        if not courses:
            return "❌ No courses found in the database."

        lines = [f"📚 Available Courses ({len(courses)} total):\n"]
        for c in courses:
            seats_left = c["seat_capacity"] - c["enrolled_count"]
            seat_icon = "🟢" if seats_left > 10 else "🟡" if seats_left > 0 else "🔴"
            lines.append(
                f"  {seat_icon} {c['course_code']} — {c['course_name']}\n"
                f"     👨‍🏫 {c['instructor']}  |  🕐 {c['time_slot']}  |  💺 {seats_left} seats left"
            )
        return "\n".join(lines)

    def _preferences_response(self) -> str:
        if not self.user or self.user.get("role") != "student":
            return (
                "📝 How to Submit Preferences:\n\n"
                "  1. Go to the Preferences page\n"
                "  2. Browse available courses on the left\n"
                "  3. Click 'Add' to select a course\n"
                "  4. Drag & drop to rank them (1 = top choice)\n"
                "  5. Click 'Submit Preferences'\n\n"
                "💡 You can submit up to 10 preferences."
            )

        prefs = self._db_query(
            """SELECT p.preference_rank, c.course_code, c.course_name, c.time_slot
               FROM preferences p JOIN courses c ON p.course_id = c.id
               WHERE p.student_id = ? ORDER BY p.preference_rank""",
            (self.user["id"],)
        )
        if prefs:
            lines = [f"📝 Your Current Preferences ({len(prefs)} courses):\n"]
            for p in prefs:
                lines.append(f"  {p['preference_rank']}. {p['course_code']} — {p['course_name']}  ({p['time_slot']})")
            lines.append("\n💡 You can update them anytime before the deadline.")
            return "\n".join(lines)
        else:
            return (
                "📝 You haven't submitted preferences yet.\n\n"
                "How to submit:\n"
                "  1. Go to the Preferences page\n"
                "  2. Add courses from the left panel\n"
                "  3. Drag to rank them\n"
                "  4. Click 'Submit Preferences'"
            )

    def _results_response(self) -> str:
        if not self.user or self.user.get("role") != "student":
            return "🎯 Allocation results are visible to students after the admin runs the allocation algorithm."

        enrollments = self._db_query(
            """SELECT c.course_code, c.course_name, c.instructor, c.time_slot, c.department
               FROM enrollments e JOIN courses c ON e.course_id = c.id
               WHERE e.student_id = ? AND e.allocation_status = 'allocated'""",
            (self.user["id"],)
        )
        if enrollments:
            lines = [f"🎯 Your Allocated Courses ({len(enrollments)}):\n"]
            for e in enrollments:
                lines.append(
                    f"  ✅ {e['course_code']} — {e['course_name']}\n"
                    f"     👨‍🏫 {e['instructor']}  |  🕐 {e['time_slot']}"
                )
            lines.append("\n📅 View your full schedule on the Results page.")
            return "\n".join(lines)
        else:
            return (
                "⏳ No courses allocated yet.\n\n"
                "Possible reasons:\n"
                "  • Allocation hasn't been run yet\n"
                "  • You haven't submitted preferences\n\n"
                "Steps:\n"
                "  1. Submit your preferences\n"
                "  2. Wait for admin to run allocation\n"
                "  3. Check back here for results"
            )

    def _gpa_response(self) -> str:
        base = (
            "📊 GPA Priority System:\n\n"
            "  • Students are sorted by GPA (highest first)\n"
            "  • Higher GPA → processed earlier → better chance of top preferences\n"
            "  • GPA scale: 0.0 – 10.0\n"
        )
        if self.user and self.user.get("role") == "student":
            student = self._db_query("SELECT gpa FROM students WHERE id = ?", (self.user["id"],))
            if student:
                gpa = student[0]["gpa"]
                # Rank among all students
                rank = self._db_query("SELECT COUNT(*) as cnt FROM students WHERE gpa > ?", (gpa,))
                rank_num = rank[0]["cnt"] + 1 if rank else "?"
                base += f"\n  Your GPA: {gpa}  (Priority rank: #{rank_num})"
        return base

    def _algorithm_response(self) -> str:
        return (
            "⚙️  How the Allocation Algorithm Works:\n\n"
            "  1. Students submit ranked preferences (1–10)\n"
            "  2. Admin triggers the allocation\n"
            "  3. Students sorted by GPA (highest first)\n"
            "  4. For each student, the system tries each preference:\n"
            "       ✅ Seat available + no time conflict → Allocate\n"
            "       ❌ No seats → Try next preference\n"
            "       ❌ Time conflict → Try next preference\n"
            "  5. Results published instantly\n\n"
            "🎯 Goal: Maximise student satisfaction within capacity limits."
        )

    def _deadline_response(self) -> str:
        setting = self._db_query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'preference_deadline'"
        )
        if setting:
            deadline = setting[0]["setting_value"]
            try:
                dt = datetime.fromisoformat(deadline)
                formatted = dt.strftime("%d %B %Y, %I:%M %p")
            except Exception:
                formatted = deadline
            return f"📅 Preference Submission Deadline:\n\n  {formatted}\n\nSubmit your preferences before this date!"
        return "📅 Deadline information is not available. Please contact your admin."

    def _admin_stats_response(self) -> str:
        stats = self._db_query(
            """SELECT
               (SELECT COUNT(*) FROM students) as total_students,
               (SELECT COUNT(*) FROM courses) as total_courses,
               (SELECT COUNT(DISTINCT student_id) FROM preferences) as with_prefs,
               (SELECT COUNT(DISTINCT student_id) FROM enrollments WHERE allocation_status='allocated') as allocated"""
        )
        if stats:
            s = stats[0]
            pending = s["total_students"] - s["allocated"]
            return (
                "📊 System Overview:\n\n"
                f"  👥 Total Students:          {s['total_students']}\n"
                f"  📚 Total Courses:           {s['total_courses']}\n"
                f"  📝 Submitted Preferences:   {s['with_prefs']}\n"
                f"  ✅ Students Allocated:      {s['allocated']}\n"
                f"  ⏳ Pending Allocation:      {pending}"
            )
        return "❌ Could not fetch system stats."

    def _help_response(self) -> str:
        return (
            "🆘 I can help you with:\n\n"
            "  📚 'Show courses'         — list all available courses\n"
            "  📝 'My preferences'       — view your submitted preferences\n"
            "  🎯 'My results'           — check allocated courses\n"
            "  ⚙️  'How does it work'    — allocation algorithm explained\n"
            "  📊 'My GPA priority'      — your priority in the queue\n"
            "  📅 'Deadline'             — submission deadline\n"
            "  👋 'Bye'                  — exit the assistant\n\n"
            "Just type naturally — I'll understand!"
        )
