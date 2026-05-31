const db = require('../config/database');
const bcrypt = require('bcrypt');

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, role, team_id, profile_pic FROM users'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// UPDATE user role or team
exports.updateUser = async (req, res) => {
  try {
    const { role, team_id } = req.body;
    await db.query(
      'UPDATE users SET role = ?, team_id = ? WHERE user_id = ?',
      [role, team_id, req.params.id]
    );
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// GET dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalPlants }]] = await db.query('SELECT COUNT(*) as totalPlants FROM plants');
    const [[{ totalTeams }]] = await db.query('SELECT COUNT(*) as totalTeams FROM teams');
    const [latestReadings] = await db.query(
      'SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 4'
    );

    res.json({ totalUsers, totalPlants, totalTeams, latestReadings });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};