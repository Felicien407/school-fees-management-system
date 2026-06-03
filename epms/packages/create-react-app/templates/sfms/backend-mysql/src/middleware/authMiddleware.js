import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    if (!env.jwtSecret) throw new Error('JWT_SECRET missing');

    const payload = jwt.verify(token, env.jwtSecret);
    const rows = await query('SELECT id, role FROM users WHERE id = ?', [payload.id]);
    if (!rows.length) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = { id: String(rows[0].id), role: rows[0].role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
