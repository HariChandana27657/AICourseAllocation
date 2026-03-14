const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Student routes
router.post('/student/login', authController.studentLogin);
router.post('/student/register', authController.studentRegister);

// Admin routes
router.post('/admin/login', authController.adminLogin);

module.exports = router;
