const db = require('../config/database');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// ─── Nodemailer Transporter (Gmail) ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,     // ex. yourapp@gmail.com
    pass: process.env.GMAIL_PASS,     // App Password, hindi ang regular na password
  },
});

// ─── OTP Store (in-memory, per session) ───────────────────────────────────────
// Format: { email: { otp, expiresAt } }
const otpStore = {};

// Helper: Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, phone_number, profile_pic, password FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user info (walang password)
    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        profile_pic: user.profile_pic,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


// ─── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { full_name, email, phone_number, password }
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone_number, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    // Check duplicate email
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone_number, password) VALUES (?, ?, ?, ?)',
      [full_name, email, phone_number, hashedPassword]
    );

    res.status(201).json({
      success: true,
      user: { user_id: result.insertId, full_name, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// ─── CHANGE PASSWORD ───────────────────────────────────────────────────────
// POST /api/auth/change-password
// Body: { email, currentPassword, newPassword }
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Email, current password, and new password are required' });
    }

    const [rows] = await db.query(
      'SELECT user_id, password FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, user.user_id]
    );

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};


// ─── SEND OTP (para sa Change Email / Change Phone verification) ──────────────
// POST /api/auth/send-otp
// Body: { email }
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // I-save sa OTP store
    otpStore[email] = { otp, expiresAt };

    // Magpadala ng email
    await transporter.sendMail({
      from: `"DhydroQuack" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 24px;">
          <h2 style="color: #4a7c59;">DhydroQuack Verification</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="letter-spacing: 8px; color: #333;">${otp}</h1>
          <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};


// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Body: { email, otp }
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP valid — i-clear na
    delete otpStore[email];

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};