const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/student/login', authController.studentLogin);
router.post('/student/register', authController.studentRegister);
router.post('/admin/login', authController.adminLogin);
router.post('/admin/reset-password', authenticateToken, isAdmin, authController.adminResetPassword);

module.exports = router;
