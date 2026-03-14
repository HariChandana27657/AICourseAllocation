const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const { authenticateToken, isAdmin, isStudent } = require('../middleware/auth');

// Student ML features
router.get('/recommendations', authenticateToken, isStudent, mlController.getRecommendations);
router.get('/allocation-probability', authenticateToken, isStudent, mlController.getAllocationProbability);
router.get('/similar-students', authenticateToken, isStudent, mlController.getSimilarStudents);

// Admin ML features
router.get('/demand-predictions', authenticateToken, isAdmin, mlController.getDemandPredictions);
router.get('/risky-courses', authenticateToken, isAdmin, mlController.getRiskyCourses);
router.post('/train', authenticateToken, isAdmin, mlController.trainModels);

// Public ML status
router.get('/status', mlController.getMLStatus);

module.exports = router;
