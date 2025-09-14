import express from 'express';
import cors from 'cors';

import postsRouter from './src/routes/posts.routes.js';
import authRouter from './src/routes/auth.routes.js';
import usersRouter from './src/routes/user.routes.js';
import debugRouter from './src/routes/debug.routes.js';

const app = express();

// CORS for your Next.js dev origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// IMPORTANT: JSON parser (avoid hanging on req.body)
app.use(express.json({ limit: '1mb' }));

// Basic health
app.get('/api/health', (req, res) => res.json({ ok: true, message: 'Server is alive' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/debug', debugRouter);

export default app;
