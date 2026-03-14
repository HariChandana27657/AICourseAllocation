const db = require('../config/db');

// Helper function for database queries
const query = async (sql, params) => {
  if (typeof db.query === 'function') {
    return await db.query(sql, params);
  } else {
    return await db.query(sql, params);
  }
};

const execute = async (sql, params) => {
  if (typeof db.execute === 'function') {
    return await db.execute(sql, params);
  } else {
    return await db.query(sql, params);
  }
};

// Internal notification helper
const createNotification = async (userId, userRole, type, title, message) => {
  try {
    await execute(
      `INSERT INTO notifications (user_id, user_role, type, title, message) VALUES (?, ?, ?, ?, ?)`,
      [userId, userRole, type, title, message]
    );
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// Get student preferences
const getPreferences = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await query(`
      SELECT p.*, c.course_code, c.course_name, c.department, c.instructor, c.time_slot,
             (c.seat_capacity - c.enrolled_count) as available_seats
      FROM preferences p
      JOIN courses c ON p.course_id = c.id
      WHERE p.student_id = ?
      ORDER BY p.preference_rank
    `, [studentId]);

    res.json(result.rows || result);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

// Submit/Update preferences
const submitPreferences = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { preferences } = req.body; // Array of { course_id, preference_rank }

    if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({ error: 'Preferences array required' });
    }

    // Validate preferences
    const courseIds = preferences.map(p => p.course_id);
    const uniqueCourses = new Set(courseIds);
    if (uniqueCourses.size !== courseIds.length) {
      return res.status(400).json({ error: 'Duplicate courses in preferences' });
    }

    // Check if courses exist
    const coursesResult = await query(
      `SELECT id FROM courses WHERE id IN (${courseIds.map(() => '?').join(',')})`,
      courseIds
    );

    if ((coursesResult.rows || coursesResult).length !== courseIds.length) {
      return res.status(400).json({ error: 'One or more invalid course IDs' });
    }

    // Delete existing preferences
    await execute('DELETE FROM preferences WHERE student_id = ?', [studentId]);

    // Insert new preferences
    for (const pref of preferences) {
      await execute(
        'INSERT INTO preferences (student_id, course_id, preference_rank) VALUES (?, ?, ?)',
        [studentId, pref.course_id, pref.preference_rank]
      );
    }

    // Fetch updated preferences
    const result = await query(`
      SELECT p.*, c.course_code, c.course_name, c.department
      FROM preferences p
      JOIN courses c ON p.course_id = c.id
      WHERE p.student_id = ?
      ORDER BY p.preference_rank
    `, [studentId]);

    // ── Notify the student ──
    const studentInfo = await query(`SELECT name FROM students WHERE id = ?`, [studentId]);
    const studentName = (studentInfo.rows || studentInfo)[0]?.name || 'Student';
    await createNotification(
      studentId, 'student', 'preference_submitted',
      '✅ Preferences Submitted',
      `Your ${preferences.length} course preference(s) have been submitted successfully. You will be notified once allocation is complete.`
    );

    // ── Notify all admins ──
    const admins = await query(`SELECT id FROM admins`, []);
    const adminRows = admins.rows || admins;
    for (const admin of adminRows) {
      await createNotification(
        admin.id, 'admin', 'new_preference',
        '📝 New Preference Submission',
        `${studentName} has submitted ${preferences.length} course preference(s). Review them in the Preferences section.`
      );
    }

    res.json({
      message: 'Preferences submitted successfully',
      preferences: result.rows || result
    });
  } catch (error) {
    console.error('Submit preferences error:', error);
    res.status(500).json({ error: 'Failed to submit preferences', details: error.message });
  }
};

// Delete preferences
const deletePreferences = async (req, res) => {
  try {
    const studentId = req.user.id;

    await execute('DELETE FROM preferences WHERE student_id = ?', [studentId]);

    res.json({ message: 'Preferences deleted successfully' });
  } catch (error) {
    console.error('Delete preferences error:', error);
    res.status(500).json({ error: 'Failed to delete preferences' });
  }
};

module.exports = {
  getPreferences,
  submitPreferences,
  deletePreferences
};
