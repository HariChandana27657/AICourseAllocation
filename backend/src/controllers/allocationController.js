const allocationService = require('../services/allocationService');

// Run allocation algorithm (Admin only)
const runAllocation = async (req, res) => {
  // Set a long timeout for large datasets
  req.setTimeout && req.setTimeout(120000);
  res.setTimeout && res.setTimeout(120000);
  try {
    const result = await allocationService.runAllocation();
    res.json(result);
  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({ error: 'Allocation failed', details: error.message });
  }
};

// Get allocation results for student
const getStudentAllocation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allocations = await allocationService.getStudentAllocation(studentId);
    res.json({
      studentId,
      allocatedCourses: allocations
    });
  } catch (error) {
    console.error('Get allocation error:', error);
    res.status(500).json({ error: 'Failed to fetch allocation results' });
  }
};

// Get all allocation results (Admin only)
const getAllAllocations = async (req, res) => {
  try {
    const results = await allocationService.getAllAllocationResults();
    
    // Group by student for easier viewing
    const grouped = {};
    for (const row of results) {
      if (!grouped[row.student_id]) {
        grouped[row.student_id] = {
          studentId: row.student_id,
          name: row.name,
          email: row.email,
          cgpa: row.cgpa,
          department: row.department,
          yearOfStudy: row.year_of_study,
          allocatedCourse: null
        };
      }
      if (row.course_code) {
        grouped[row.student_id].allocatedCourse = {
          courseCode: row.course_code,
          courseName: row.course_name,
          section: row.section,
          instructor: row.instructor,
          timeSlot: row.time_slot,
          allocatedAt: row.allocated_at,
          status: row.allocation_status
        };
      }
    }

    res.json({
      totalStudents: Object.keys(grouped).length,
      allocations: Object.values(grouped)
    });
  } catch (error) {
    console.error('Get all allocations error:', error);
    res.status(500).json({ error: 'Failed to fetch allocation results' });
  }
};

// Mark a course as completed for student
const markCourseCompleted = async (req, res) => {
  try {
    const { courseId, semester, grade } = req.body;
    const studentId = req.user.id;

    if (!courseId || !semester) {
      return res.status(400).json({ error: 'Course ID and semester required' });
    }

    const result = await allocationService.markCourseCompleted(studentId, courseId, semester, grade || 'A');
    res.json(result);
  } catch (error) {
    console.error('Mark completed error:', error);
    res.status(500).json({ error: 'Failed to mark course as completed' });
  }
};

// Get student's completed courses
const getCompletedCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await allocationService.getStudentCompletedCourses(studentId);
    
    res.json({
      studentId,
      completedCourses: courses
    });
  } catch (error) {
    console.error('Get completed courses error:', error);
    res.status(500).json({ error: 'Failed to fetch completed courses' });
  }
};

module.exports = {
  runAllocation,
  getStudentAllocation,
  getAllAllocations,
  markCourseCompleted,
  getCompletedCourses
};
