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
    const { course_code, course_name, department, instructor, seat_capacity, time_slot, description } = req.body;

    if (!course_code || !course_name || !department || !seat_capacity || !time_slot) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check if course code already exists
    const existing = await query('SELECT id FROM courses WHERE course_code = ?', [course_code]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    // Insert course
    const result = await execute(
      'INSERT INTO courses (course_code, course_name, department, instructor, seat_capacity, enrolled_count, time_slot, description) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
      [course_code, course_name, department, instructor || '', seat_capacity, time_slot, description || '']
    );

    // Get the inserted course
    const newCourse = await query('SELECT * FROM courses WHERE id = ?', [result.rows[0].id]);
    
    res.status(201).json(newCourse.rows[0]);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course', details: error.message });
  }
};

// Update course (Admin only)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, course_name, department, instructor, seat_capacity, time_slot, description } = req.body;

    // Check if course exists
    const existing = await query('SELECT id FROM courses WHERE id = ?', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update course
    await execute(
      'UPDATE courses SET course_code = ?, course_name = ?, department = ?, instructor = ?, seat_capacity = ?, time_slot = ?, description = ? WHERE id = ?',
      [course_code, course_name, department, instructor || '', seat_capacity, time_slot, description || '', id]
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
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
