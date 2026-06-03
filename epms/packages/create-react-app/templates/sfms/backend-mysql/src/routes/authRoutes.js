import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';

const router = Router();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function signToken(user) {
  if (!env.jwtSecret) throw new Error('JWT_SECRET');
  return jwt.sign({ id: String(user.id), role: user.role }, env.jwtSecret, { expiresIn: '7d' });
}

function toUserApi(user) {
  return {
    id: String(user.id),
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const usernameNorm = String(username).trim();
    const emailNorm = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const existingUser = await query('SELECT id FROM users WHERE username = ?', [usernameNorm]);
    if (existingUser.length) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const exists = await query('SELECT id FROM users WHERE email = ?', [emailNorm]);
    if (exists.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(String(password), 12);
    const result = await query(
      'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [usernameNorm, usernameNorm, emailNorm, hash, role === 'staff' ? 'staff' : 'admin']
    );
    const rows = await query(
      'SELECT id, username, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    const user = rows[0];
    const token = signToken(user);
    return res.status(201).json({ token, user: toUserApi(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const rows = await query('SELECT * FROM users WHERE username = ?', [String(username).trim()]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(String(password), user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: toUserApi(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required.' });
    }
    if (!confirmPassword) {
      return res.status(400).json({ success: false, message: 'Confirm password is required.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password must match.',
      });
    }
    const emailNorm = normalizeEmail(email);
    const rows = await query('SELECT id FROM users WHERE email = ?', [emailNorm]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const hash = await bcrypt.hash(String(newPassword), 12);
    await query('UPDATE users SET password = ? WHERE email = ?', [hash, emailNorm]);
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
