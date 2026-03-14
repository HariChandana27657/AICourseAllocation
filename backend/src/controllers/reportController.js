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

// Get enrollment report
const getEnrollmentReport = async (req, res) => {
  try {
    const result = await query(`
      SELECT c.id, c.course_code, c.course_name, c.department, 
             c.instructor, c.seat_capacity, c.enrolled_count,
             (c.seat_capacity - c.enrolled_count) as available_seats,
             ROUND((c.enrolled_count * 100.0 / c.seat_capacity), 2) as utilization_percentage
      FROM courses c
      ORDER BY c.enrolled_count DESC
    `, []);

    res.json(result.rows || result);
  } catch (error) {
    console.error('Enrollment report error:', error);
    res.status(500).json({ error: 'Failed to generate enrollment report' });
  }
};

// Get unallocated students
const getUnallocatedStudents = async (req, res) => {
  try {
    const result = await query(`
      SELECT s.id, s.name, s.email, s.department, s.gpa,
             COUNT(DISTINCT p.id) as preferences_submitted,
             COUNT(DISTINCT e.id) as courses_allocated
      FROM students s
      LEFT JOIN preferences p ON s.id = p.student_id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.allocation_status = 'allocated'
      GROUP BY s.id, s.name, s.email, s.department, s.gpa
      HAVING COUNT(DISTINCT p.id) > 0 AND COUNT(DISTINCT e.id) = 0
      ORDER BY s.gpa DESC
    `, []);

    res.json(result.rows || result);
  } catch (error) {
    console.error('Unallocated students error:', error);
    res.status(500).json({ error: 'Failed to fetch unallocated students' });
  }
};

// Get course demand analysis
const getCourseDemand = async (req, res) => {
  try {
    const result = await query(`
      SELECT c.id, c.course_code, c.course_name, c.department,
             c.seat_capacity, c.enrolled_count,
             COUNT(p.id) as total_preferences,
             SUM(CASE WHEN p.preference_rank = 1 THEN 1 ELSE 0 END) as first_choice_count,
             SUM(CASE WHEN p.preference_rank <= 3 THEN 1 ELSE 0 END) as top_three_count,
             ROUND((COUNT(p.id) * 1.0 / CASE WHEN c.seat_capacity = 0 THEN 1 ELSE c.seat_capacity END), 2) as demand_ratio
      FROM courses c
      LEFT JOIN preferences p ON c.id = p.course_id
      GROUP BY c.id, c.course_code, c.course_name, c.department, c.seat_capacity, c.enrolled_count
      ORDER BY demand_ratio DESC
    `, []);

    res.json(result.rows || result);
  } catch (error) {
    console.error('Course demand error:', error);
    res.status(500).json({ error: 'Failed to generate course demand report' });
  }
};

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(DISTINCT student_id) FROM preferences) as students_with_preferences,
        (SELECT COUNT(DISTINCT student_id) FROM enrollments WHERE allocation_status = 'allocated') as students_allocated,
        (SELECT SUM(enrolled_count) FROM courses) as total_enrollments,
        (SELECT SUM(seat_capacity) FROM courses) as total_capacity
    `, []);

    const popularCourses = await query(`
      SELECT c.course_code, c.course_name, COUNT(p.id) as preference_count
      FROM courses c
      LEFT JOIN preferences p ON c.id = p.course_id
      GROUP BY c.id, c.course_code, c.course_name
      ORDER BY preference_count DESC
      LIMIT 5
    `, []);

    const departmentStats = await query(`
      SELECT department, COUNT(*) as course_count, SUM(enrolled_count) as total_enrolled
      FROM courses
      GROUP BY department
      ORDER BY total_enrolled DESC
    `, []);

    const overview = (result.rows || result)[0] || stats.rows[0] || stats[0];
    const totalCapacity = overview.total_capacity || 1;
    const totalEnrollments = overview.total_enrollments || 0;
    overview.avg_utilization = Math.round((totalEnrollments / totalCapacity) * 100 * 100) / 100;

    res.json({
      overview,
      popularCourses: popularCourses.rows || popularCourses,
      departmentStats: departmentStats.rows || departmentStats
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Get all student preferences (for admin)
const getAllPreferences = async (req, res) => {
  try {
    const result = await query(`
      SELECT s.id as student_id, s.name as student_name, s.email, s.department, s.gpa,
             p.preference_rank, c.course_code, c.course_name, c.department as course_department,
             c.time_slot, c.seat_capacity, c.enrolled_count
      FROM preferences p
      JOIN students s ON p.student_id = s.id
      JOIN courses c ON p.course_id = c.id
      ORDER BY s.name, p.preference_rank
    `, []);

    const rows = result.rows || result;

    // Group by student
    const studentPreferences = {};
    rows.forEach(row => {
      if (!studentPreferences[row.student_id]) {
        studentPreferences[row.student_id] = {
          student_id: row.student_id,
          student_name: row.student_name,
          email: row.email,
          department: row.department,
          gpa: row.gpa,
          preferences: []
        };
      }
      studentPreferences[row.student_id].preferences.push({
        rank: row.preference_rank,
        course_code: row.course_code,
        course_name: row.course_name,
        course_department: row.course_department,
        time_slot: row.time_slot,
        seat_capacity: row.seat_capacity,
        enrolled_count: row.enrolled_count
      });
    });

    res.json(Object.values(studentPreferences));
  } catch (error) {
    console.error('Get all preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch student preferences' });
  }
};

module.exports = {
  getEnrollmentReport,
  getUnallocatedStudents,
  getCourseDemand,
  getDashboardAnalytics,
  getAllPreferences
};
