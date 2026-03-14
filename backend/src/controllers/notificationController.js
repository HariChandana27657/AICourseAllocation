const db = require('../config/db');

const query = async (sql, params = []) => {
  const r = await db.query(sql, params);
  return r.rows || r;
};
const execute = async (sql, params = []) => {
  if (typeof db.execute === 'function') return await db.execute(sql, params);
  return await db.query(sql, params);
};

// Create a notification (internal helper)
const createNotification = async (userId, userRole, type, title, message) => {
  await execute(
    `INSERT INTO notifications (user_id, user_role, type, title, message) VALUES (?, ?, ?, ?, ?)`,
    [userId, userRole, type, title, message]
  );
};

// GET /api/notifications  — get notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const { id, role } = req.user;
    const rows = await query(
      `SELECT * FROM notifications WHERE user_id = ? AND user_role = ? ORDER BY created_at DESC LIMIT 50`,
      [id, role]
    );
    const unread = rows.filter(n => !n.is_read).length;
    res.json({ notifications: rows, unread });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    const { id, role } = req.user;
    const notifId = req.params.id;
    await execute(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND user_role = ?`,
      [notifId, id, role]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    const { id, role } = req.user;
    await execute(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_role = ?`,
      [id, role]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const { id, role } = req.user;
    await execute(
      `DELETE FROM notifications WHERE id = ? AND user_id = ? AND user_role = ?`,
      [req.params.id, id, role]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, createNotification };
