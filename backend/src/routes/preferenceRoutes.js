const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const { authenticateToken, isStudent } = require('../middleware/auth');

// Student preference routes
router.get('/', authenticateToken, isStudent, preferenceController.getPreferences);
router.post('/', authenticateToken, isStudent, preferenceController.submitPreferences);
router.delete('/', authenticateToken, isStudent, preferenceController.deletePreferences);

module.exports = router;
