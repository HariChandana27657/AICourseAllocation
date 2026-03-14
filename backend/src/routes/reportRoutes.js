const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Admin report routes
router.get('/enrollment', authenticateToken, isAdmin, reportController.getEnrollmentReport);
router.get('/unallocated', authenticateToken, isAdmin, reportController.getUnallocatedStudents);
router.get('/demand', authenticateToken, isAdmin, reportController.getCourseDemand);
router.get('/analytics', authenticateToken, isAdmin, reportController.getDashboardAnalytics);
router.get('/preferences', authenticateToken, isAdmin, reportController.getAllPreferences);

module.exports = router;
