const db = require('../config/db');

const query = async (sql, params = []) => {
  const result = await db.query(sql, params);
  return result.rows || result;
};

// Knowledge base for the chatbot
const getBotResponse = async (message, userId, userRole) => {
  const msg = message.toLowerCase().trim();

  // ── Greetings ──
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/.test(msg)) {
    return {
      text: `Hello! 👋 I'm your Course Allocation Assistant. I can help you with:\n\n• 📚 Course information\n• 📝 Submitting preferences\n• 🎯 Allocation results\n• ❓ General questions\n\nWhat would you like to know?`,
      suggestions: ['Show available courses', 'How to submit preferences', 'Check my results', 'How does allocation work?']
    };
  }

  // ── Courses ──
  if (/course|subject|class|available/.test(msg)) {
    const courses = await query(`SELECT course_code, course_name, department, instructor, seat_capacity, enrolled_count, time_slot FROM courses ORDER BY department`);
    if (courses.length === 0) {
      return { text: 'No courses are available at the moment. Please check back later.', suggestions: [] };
    }
    const list = courses.map(c =>
      `• **${c.course_code}** — ${c.course_name}\n  👨‍🏫 ${c.instructor} | 🕐 ${c.time_slot} | 💺 ${c.seat_capacity - c.enrolled_count} seats left`
    ).join('\n\n');
    return {
      text: `📚 **Available Courses (${courses.length} total):**\n\n${list}`,
      suggestions: ['How to submit preferences', 'Check my results', 'What is GPA priority?']
    };
  }

  // ── Preferences ──
  if (/preference|submit|rank|choose|select|pick/.test(msg)) {
    if (userRole === 'student') {
      const prefs = await query(`SELECT p.preference_rank, c.course_code, c.course_name FROM preferences p JOIN courses c ON p.course_id = c.id WHERE p.student_id = ? ORDER BY p.preference_rank`, [userId]);
      if (prefs.length > 0) {
        const list = prefs.map(p => `  ${p.preference_rank}. ${p.course_code} — ${p.course_name}`).join('\n');
        return {
          text: `📝 **Your current preferences:**\n\n${list}\n\nYou can update them anytime from the **Preferences** page before the deadline.`,
          suggestions: ['How does allocation work?', 'Check my results', 'Show available courses']
        };
      }
    }
    return {
      text: `📝 **How to submit preferences:**\n\n1. Go to the **Preferences** page\n2. Browse available courses on the left\n3. Click **Add** to select a course\n4. **Drag & drop** to rank them (1 = top choice)\n5. Click **Submit Preferences**\n\n💡 Tip: You can submit up to 10 preferences. Higher-ranked choices are prioritised during allocation.`,
      suggestions: ['Show available courses', 'What is GPA priority?', 'Check my results']
    };
  }

  // ── Results / Allocation ──
  if (/result|allocat|assign|enroll|my course/.test(msg)) {
    if (userRole === 'student') {
      const enrollments = await query(`SELECT c.course_code, c.course_name, c.instructor, c.time_slot, c.department FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.student_id = ? AND e.allocation_status = 'allocated'`, [userId]);
      if (enrollments.length > 0) {
        const list = enrollments.map(e =>
          `• **${e.course_code}** — ${e.course_name}\n  👨‍🏫 ${e.instructor} | 🕐 ${e.time_slot}`
        ).join('\n\n');
        return {
          text: `🎯 **Your allocated courses (${enrollments.length}):**\n\n${list}\n\nView your full schedule on the **Results** page.`,
          suggestions: ['How does allocation work?', 'Show available courses', 'Contact support']
        };
      } else {
        return {
          text: `⏳ **No courses allocated yet.**\n\nAllocation hasn't run yet, or you haven't submitted preferences.\n\n**Steps:**\n1. Submit your preferences\n2. Wait for admin to run the allocation\n3. Check back here for results`,
          suggestions: ['How to submit preferences', 'Show available courses', 'How does allocation work?']
        };
      }
    }
    return {
      text: `🎯 **Allocation Results**\n\nStudents can view their allocated courses on the **Results** page after the admin runs the allocation algorithm.\n\nThe algorithm considers:\n• GPA priority\n• Preference ranking\n• Seat availability\n• Time slot conflicts`,
      suggestions: ['How does allocation work?', 'What is GPA priority?']
    };
  }

  // ── GPA / Priority ──
  if (/gpa|grade|priority|point|score/.test(msg)) {
    if (userRole === 'student' && userId) {
      const student = await query(`SELECT name, gpa FROM students WHERE id = ?`, [userId]);
      if (student.length > 0) {
        return {
          text: `📊 **Your GPA: ${student[0].gpa}**\n\n**How GPA affects allocation:**\n\n• Students are sorted by GPA (highest first)\n• Higher GPA = earlier processing = better chance of getting top preferences\n• Within the same GPA, student ID order is used\n\n💡 Your GPA of **${student[0].gpa}** determines your priority in the queue.`,
          suggestions: ['Check my results', 'How to submit preferences', 'Show available courses']
        };
      }
    }
    return {
      text: `📊 **GPA Priority System:**\n\nThe allocation algorithm processes students in order of GPA (highest first).\n\n• **Higher GPA** → processed earlier → better chance of getting preferred courses\n• **Lower GPA** → processed later → some courses may be full\n\nThis ensures academic merit is rewarded in course selection.`,
      suggestions: ['How does allocation work?', 'How to submit preferences']
    };
  }

  // ── How allocation works ──
  if (/how.*work|algorithm|process|system/.test(msg)) {
    return {
      text: `⚙️ **How the Allocation Algorithm Works:**\n\n1. **Students submit preferences** (ranked 1–10)\n2. **Admin triggers** the allocation\n3. Students sorted by **GPA** (highest first)\n4. For each student, the system tries each preference in order:\n   - ✅ Seat available? → Allocate\n   - ❌ No seats? → Try next preference\n   - ❌ Time conflict? → Try next preference\n5. Results are published instantly\n\n🎯 The goal is to maximise student satisfaction while respecting capacity limits.`,
      suggestions: ['What is GPA priority?', 'How to submit preferences', 'Check my results']
    };
  }

  // ── Deadline ──
  if (/deadline|when|date|time|last/.test(msg)) {
    const setting = await query(`SELECT setting_value FROM system_settings WHERE setting_key = 'preference_deadline'`);
    const deadline = setting.length > 0 ? new Date(setting[0].setting_value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set';
    return {
      text: `📅 **Preference Submission Deadline:**\n\n**${deadline}**\n\nMake sure to submit your preferences before this date. Late submissions may not be considered.`,
      suggestions: ['How to submit preferences', 'Show available courses']
    };
  }

  // ── Admin-specific ──
  if (userRole === 'admin' && /student|total|stat|report|overview/.test(msg)) {
    const stats = await query(`SELECT (SELECT COUNT(*) FROM students) as students, (SELECT COUNT(*) FROM courses) as courses, (SELECT COUNT(DISTINCT student_id) FROM preferences) as with_prefs, (SELECT COUNT(DISTINCT student_id) FROM enrollments WHERE allocation_status='allocated') as allocated`);
    const s = stats[0];
    return {
      text: `📊 **System Overview:**\n\n• 👥 Total Students: **${s.students}**\n• 📚 Total Courses: **${s.courses}**\n• 📝 Students with Preferences: **${s.with_prefs}**\n• ✅ Students Allocated: **${s.allocated}**\n• ⏳ Pending Allocation: **${s.students - s.allocated}**`,
      suggestions: ['How does allocation work?', 'Show available courses']
    };
  }

  // ── Help ──
  if (/help|support|contact|assist/.test(msg)) {
    return {
      text: `🆘 **I can help you with:**\n\n• 📚 **Courses** — list, details, availability\n• 📝 **Preferences** — how to submit, view current\n• 🎯 **Results** — check allocated courses\n• ⚙️ **Algorithm** — how allocation works\n• 📊 **GPA** — priority system explained\n• 📅 **Deadline** — submission deadline\n\nJust type your question naturally!`,
      suggestions: ['Show available courses', 'How to submit preferences', 'Check my results', 'How does allocation work?']
    };
  }

  // ── Farewell ──
  if (/bye|goodbye|thanks|thank you|see you/.test(msg)) {
    return {
      text: `👋 Goodbye! Good luck with your course selection. Feel free to come back anytime you have questions! 😊`,
      suggestions: ['Show available courses', 'How to submit preferences']
    };
  }

  // ── Default fallback ──
  return {
    text: `🤔 I'm not sure about that. Here are some things I can help with:`,
    suggestions: ['Show available courses', 'How to submit preferences', 'Check my results', 'How does allocation work?', 'What is GPA priority?']
  };
};

// POST /api/chat
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await getBotResponse(message, userId, userRole);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      text: '⚠️ Sorry, I encountered an error. Please try again.',
      suggestions: ['Show available courses', 'How to submit preferences']
    });
  }
};

module.exports = { chat };
