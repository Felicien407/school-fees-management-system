import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const router = Router();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function jwtSecret() {
  return env.jwtSecret;
}

function signToken(user) {
  const secret = jwtSecret();
  if (!secret) throw new Error('JWT_SECRET');
  return jwt.sign({ id: String(user._id), role: user.role }, secret, { expiresIn: '7d' });
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

    const existingUser = await User.findOne({ username: usernameNorm });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const exists = await User.findOne({ email: emailNorm });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      username: usernameNorm,
      name: usernameNorm,
      email: emailNorm,
      password: hash,
      role: role === 'staff' ? 'staff' : 'admin',
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
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

    const user = await User.findOne({ username: String(username).trim() }).select('+password');
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
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
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
    const user = await User.findOne({ email: emailNorm }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.password = await bcrypt.hash(String(newPassword), 12);
    await user.save();
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
