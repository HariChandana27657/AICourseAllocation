const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { authenticateToken, isAdmin, isStudent } = require('../middleware/auth');

// Admin route - run allocation
router.post('/run', authenticateToken, isAdmin, allocationController.runAllocation);

// Student route - get allocation results
router.get('/results', authenticateToken, isStudent, allocationController.getStudentAllocation);

module.exports = router;
