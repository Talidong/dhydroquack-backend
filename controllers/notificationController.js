const db = require('../config/database');

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get notifications by user
exports.getNotificationsByUser = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get unread notifications by user
exports.getUnreadByUser = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notifications WHERE alert_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { user_id, alert_type, message } = req.body;

    // Check if user exists before inserting (avoid FK constraint crash)
    const [user] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [result] = await db.query(
      'INSERT INTO notifications (user_id, alert_type, message) VALUES (?, ?, ?)',
      [user_id, alert_type, message]
    );
    res.status(201).json({ alert_id: result.insertId, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE alert_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await db.query('DELETE FROM notifications WHERE alert_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};