const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getNotifications);
router.patch('/read-all', authenticateToken, markAllRead);
router.patch('/:id/read', authenticateToken, markRead);
router.delete('/:id', authenticateToken, deleteNotification);

module.exports = router;
