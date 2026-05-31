const db = require('../config/database');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const otpStore = {};
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const [rows] = await db.query(
      'SELECT user_id, full_name, email, profile_pic, password, role, team_id FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ error: 'Invalid email or password' });

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        profile_pic: user.profile_pic,
        role: user.role,
        team_id: user.team_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, team_id } = req.body;

    if (!full_name || !email || !password || !team_id)
      return res.status(400).json({ error: 'Full name, email, password, and team are required' });

    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, team_id) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, team_id]
    );

    res.status(201).json({
      success: true,
      user: { user_id: result.insertId, full_name, email, team_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword)
      return res.status(400).json({ error: 'All fields are required' });

    const [rows] = await db.query(
      'SELECT user_id, password FROM users WHERE email = ?', [email]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch)
      return res.status(401).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, rows[0].user_id]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// SEND OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = generateOtp();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await transporter.sendMail({
      from: `"DhydroQuack" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 24px;">
          <h2 style="color: #4a7c59;">DhydroQuack Verification</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="letter-spacing: 8px; color: #333;">${otp}</h1>
          <p style="color: #999; font-size: 12px;">Expires in 5 minutes. Do not share.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: 'Email and OTP are required' });

    const record = otpStore[email];
    if (!record)
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (record.otp !== otp)
      return res.status(400).json({ error: 'Invalid OTP' });

    delete otpStore[email];
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};