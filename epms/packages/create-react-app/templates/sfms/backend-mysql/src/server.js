import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { env, requireJwtSecret } from './config/env.js';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

requireJwtSecret();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'SFMS' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

const ok = await connectDatabase();
if (!ok) {
  console.error('Cannot start without database');
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`SFMS API (MySQL) on http://localhost:${env.port}`);
});
