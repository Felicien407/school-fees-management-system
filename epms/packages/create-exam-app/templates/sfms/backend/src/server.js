import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { env, requireMongoUri } from './config/env.js';
import { connectMongo } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'SFMS' });
});

app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

await connectMongo(requireMongoUri());
console.log('MongoDB connected');

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
