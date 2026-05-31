const db = require('../config/database');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, profile_pic, role, team_id FROM users'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, profile_pic, role, team_id FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, role, team_id } = req.body;

    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role, team_id) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, role || 'user', team_id || null]
    );
    res.status(201).json({ user_id: result.insertId, full_name, email });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { full_name, email, profile_pic, team_id } = req.body;

    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
      [email, req.params.id]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'Email already in use' });

    await db.query(
      'UPDATE users SET full_name = ?, email = ?, profile_pic = ?, team_id = ? WHERE user_id = ?',
      [full_name, email, profile_pic, team_id, req.params.id]
    );
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};