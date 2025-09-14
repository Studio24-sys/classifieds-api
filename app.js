// app.js (ESM)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import postsRouter from './src/routes/posts.routes.js';
import authRouter from './src/routes/auth.routes.js';
import usersRouter from './src/routes/user.routes.js';

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: false,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// Routes
app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

export default app;
