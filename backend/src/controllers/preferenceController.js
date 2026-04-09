const db = require('../config/db');

const query = async (sql, params) => {
  const r = await db.query(sql, params);
  return r.rows || r;
};
const execute = async (sql, params) => {
  if (typeof db.execute === 'function') return await db.execute(sql, params);
  return await db.query(sql, params);
};

const createNotification = async (userId, userRole, type, title, message) => {
  try {
    await execute(
      `INSERT INTO notifications (user_id, user_role, type, title, message) VALUES (?, ?, ?, ?, ?)`,
      [userId, userRole, type, title, message]
    );
  } catch (e) { /* silent */ }
};

// GET /api/preferences
const getPreferences = async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await query(`
      SELECT p.*, c.course_code, c.course_name, c.department, c.instructor,
             c.time_slot, c.section, c.course_type, c.year_of_study,
             (c.seat_capacity - c.enrolled_count) as available_seats
      FROM preferences p
      JOIN courses c ON p.course_id = c.id
      WHERE p.student_id = ?
      ORDER BY p.preference_rank
    `, [studentId]);
    res.json(result);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

// POST /api/preferences
const submitPreferences = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({ error: 'Preferences array required' });
    }

    const courseIds = preferences.map(p => p.course_id);

    // No duplicates
    if (new Set(courseIds).size !== courseIds.length) {
      return res.status(400).json({ error: 'Duplicate courses in preferences' });
    }

    // Get student info
    const students = await query(`SELECT name, year_of_study, gpa FROM students WHERE id = ?`, [studentId]);
    const student = students[0];
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Validate courses exist
    const courses = await query(
      `SELECT id, course_code, year_of_study, course_type FROM courses WHERE id IN (${courseIds.map(() => '?').join(',')})`,
      courseIds
    );
    if (courses.length !== courseIds.length) {
      return res.status(400).json({ error: 'One or more invalid course IDs' });
    }

    // Rule: only elective courses
    const nonElective = courses.filter(c => c.course_type !== 'elective');
    if (nonElective.length > 0) {
      return res.status(400).json({ error: `Only elective courses can be selected. Non-elective: ${nonElective.map(c => c.course_code).join(', ')}` });
    }

    // Rule: courses must match student's year_of_study
    const wrongYear = courses.filter(c => c.year_of_study && c.year_of_study !== student.year_of_study);
    if (wrongYear.length > 0) {
      return res.status(400).json({ error: `Courses not for your year (Year ${student.year_of_study}): ${wrongYear.map(c => c.course_code).join(', ')}` });
    }

    // Rule: cannot re-select already completed courses
    const completed = await query(
      `SELECT cc.course_id, c.course_code FROM completed_courses cc
       JOIN courses c ON cc.course_id = c.id
       WHERE cc.student_id = ? AND cc.course_id IN (${courseIds.map(() => '?').join(',')})`,
      [studentId, ...courseIds]
    );
    if (completed.length > 0) {
      return res.status(400).json({
        error: `Cannot select already completed courses: ${completed.map(c => c.course_code).join(', ')}`
      });
    }

    // Save preferences
    await execute('DELETE FROM preferences WHERE student_id = ?', [studentId]);
    for (const pref of preferences) {
      await execute(
        'INSERT INTO preferences (student_id, course_id, preference_rank) VALUES (?, ?, ?)',
        [studentId, pref.course_id, pref.preference_rank]
      );
    }

    // Notify student
    await createNotification(studentId, 'student', 'preference_submitted',
      '✅ Preferences Submitted',
      `Your ${preferences.length} elective preference(s) submitted. You will be notified after allocation.`
    );

    // Notify admins
    const admins = await query(`SELECT id FROM admins`, []);
    for (const admin of admins) {
      await createNotification(admin.id, 'admin', 'new_preference',
        '📝 New Preference Submission',
        `${student.name} (CGPA: ${student.gpa}, Year ${student.year_of_study}) submitted ${preferences.length} elective preference(s).`
      );
    }

    const result = await query(`
      SELECT p.*, c.course_code, c.course_name, c.department, c.section, c.time_slot
      FROM preferences p JOIN courses c ON p.course_id = c.id
      WHERE p.student_id = ? ORDER BY p.preference_rank
    `, [studentId]);

    res.json({ message: 'Preferences submitted successfully', preferences: result });
  } catch (error) {
    console.error('Submit preferences error:', error);
    res.status(500).json({ error: 'Failed to submit preferences', details: error.message });
  }
};

// DELETE /api/preferences
const deletePreferences = async (req, res) => {
  try {
    await execute('DELETE FROM preferences WHERE student_id = ?', [req.user.id]);
    res.json({ message: 'Preferences deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete preferences' });
  }
};

module.exports = { getPreferences, submitPreferences, deletePreferences };
