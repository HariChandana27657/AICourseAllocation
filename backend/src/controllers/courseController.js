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

// Get courses for student's year of study (electives only)
const getCoursesByYearOfStudy = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's year of study
    const studentResult = await query('SELECT year_of_study FROM students WHERE id = ?', [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentResult.rows[0];
    const yearOfStudy = student.year_of_study;

    // Get elective courses for this year of study
    const result = await query(
      `SELECT * FROM courses WHERE year_of_study = ? AND course_type = 'elective' ORDER BY course_code, section`,
      [yearOfStudy]
    );

    // Get completed courses for this student
    const completedResult = await query(
      `SELECT course_id FROM completed_courses WHERE student_id = ?`,
      [studentId]
    );

    const completedCourseIds = new Set((completedResult.rows || completedResult).map(row => row.course_id));

    // Add available_seats and mark completed courses
    const coursesWithSeats = (result.rows || result).map(course => ({
      ...course,
      available_seats: course.seat_capacity - course.enrolled_count,
      isCompleted: completedCourseIds.has(course.id)
    }));

    res.json(coursesWithSeats);
  } catch (error) {
    console.error('Get courses by year error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const result = await query('SELECT * FROM courses ORDER BY course_code', []);
    
    // Add available_seats to each course
    const coursesWithSeats = result.rows.map(course => ({
      ...course,
      available_seats: course.seat_capacity - course.enrolled_count,
      prerequisites: []
    }));

    res.json(coursesWithSeats);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM courses WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = result.rows[0];
    course.available_seats = course.seat_capacity - course.enrolled_count;
    course.prerequisites = [];

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Create course (Admin only)
const createCourse = async (req, res) => {
  try {
    const {
      course_code, course_name, department, instructor,
      section = 'A',
      course_type = 'elective',
      year_of_study = 3,
      seat_capacity, time_slot, description
    } = req.body;

    if (!course_code || !course_name || !department || !seat_capacity || !time_slot) {
      return res.status(400).json({ error: 'Required fields: course_code, course_name, department, seat_capacity, time_slot' });
    }

    // Check if course code with same section already exists
    const existing = await query('SELECT id FROM courses WHERE course_code = ? AND section = ?', [course_code, section]);
    const existingRows = existing.rows || existing;
    if (existingRows.length > 0) {
      return res.status(400).json({ error: `Course ${course_code} section ${section} already exists` });
    }

    const result = await execute(
      `INSERT INTO courses (course_code, course_name, department, instructor, section, course_type, year_of_study, seat_capacity, enrolled_count, time_slot, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [course_code, course_name, department, instructor || '', section, course_type, year_of_study, seat_capacity, time_slot, description || '']
    );

    const newCourse = await query('SELECT * FROM courses WHERE id = ?', [(result.rows || result)[0].id]);
    const row = (newCourse.rows || newCourse)[0];
    res.status(201).json({ ...row, available_seats: row.seat_capacity - row.enrolled_count });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course', details: error.message });
  }
};

// Update course (Admin only)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, course_name, department, instructor, section, course_type, year_of_study, seat_capacity, time_slot, description } = req.body;

    // Check if course exists
    const existing = await query('SELECT id FROM courses WHERE id = ?', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update course
    await execute(
      `UPDATE courses SET course_code = ?, course_name = ?, department = ?, instructor = ?, section = ?, course_type = ?, year_of_study = ?, seat_capacity = ?, time_slot = ?, description = ? WHERE id = ?`,
      [course_code || '', course_name || '', department || '', instructor || '', section || '', course_type || 'elective', year_of_study || 1, seat_capacity || 0, time_slot || '', description || '', id]
    );

    // Get updated course
    const updated = await query('SELECT * FROM courses WHERE id = ?', [id]);
    
    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course', details: error.message });
  }
};

// Delete course (Admin only)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existing = await query('SELECT id FROM courses WHERE id = ?', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete course
    await execute('DELETE FROM courses WHERE id = ?', [id]);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course', details: error.message });
  }
};

module.exports = {
  getAllCourses,
  getCoursesByYearOfStudy,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
