const db = require('../config/database');
const bcrypt = require('bcrypt');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, phone_number, profile_pic FROM users'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, phone_number, profile_pic FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, phone_number, password } = req.body;

    // Check for duplicate email
    const [existingUser] = await db.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone_number, password) VALUES (?, ?, ?, ?)',
      [full_name, email, phone_number, hashedPassword]
    );
    res.status(201).json({ user_id: result.insertId, full_name, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { full_name, email, phone_number, profile_pic } = req.body;

    // Check if email is already used by another user
    const [existingUser] = await db.query(
      'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
      [email, req.params.id]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email is already in use by another account' });
    }

    await db.query(
      'UPDATE users SET full_name = ?, email = ?, phone_number = ?, profile_pic = ? WHERE user_id = ?',
      [full_name, email, phone_number, profile_pic, req.params.id]
    );
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};