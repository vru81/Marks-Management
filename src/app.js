import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/authRoutes.js';
import { meRouter } from './routes/meRoutes.js';
import { teacherRouter } from './routes/teacherRoutes.js';
import { protectTeacher } from './middleware/authMiddleware.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:5173,https://marks-management-three.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins,  credentials: true, }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/me', protectTeacher, meRouter);
app.use('/api/teachers', teacherRouter);

app.use(notFound);
app.use(errorHandler);
