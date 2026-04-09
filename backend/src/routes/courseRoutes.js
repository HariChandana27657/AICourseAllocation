const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public/Student routes
router.get('/', authenticateToken, courseController.getAllCourses);
router.get('/available/by-year', authenticateToken, courseController.getCoursesByYearOfStudy);
router.get('/:id', authenticateToken, courseController.getCourseById);

// Admin routes
router.post('/', authenticateToken, isAdmin, courseController.createCourse);
router.put('/:id', authenticateToken, isAdmin, courseController.updateCourse);
router.delete('/:id', authenticateToken, isAdmin, courseController.deleteCourse);

module.exports = router;
