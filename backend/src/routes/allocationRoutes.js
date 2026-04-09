const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { authenticateToken, isAdmin, isStudent } = require('../middleware/auth');

// Admin route - run allocation
router.post('/run', authenticateToken, isAdmin, allocationController.runAllocation);

// Admin route - get all allocation results
router.get('/all', authenticateToken, isAdmin, allocationController.getAllAllocations);

// Student route - get allocation results (includes year of study)
router.get('/results', authenticateToken, isStudent, allocationController.getStudentAllocation);

// Student route - get completed courses
router.get('/completed-courses', authenticateToken, isStudent, allocationController.getCompletedCourses);

// Student route - mark course as completed
router.post('/mark-completed', authenticateToken, isStudent, allocationController.markCourseCompleted);

module.exports = router;
