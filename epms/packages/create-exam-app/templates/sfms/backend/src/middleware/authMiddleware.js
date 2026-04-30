import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

function jwtSecret() {
  return env.jwtSecret;
}

/** Validates Bearer JWT and attaches req.user */
export async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const secret = jwtSecret();
    if (!secret) throw new Error('JWT_SECRET missing');

    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = { id: String(user._id), role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
