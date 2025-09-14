// app.js (ESM)
import express from 'express';
import cors from 'cors';
import postsRouter from './src/routes/posts.routes.js';
import authRouter  from './src/routes/auth.routes.js';
import usersRouter from './src/routes/user.routes.js';

const app = express();

const allowed = (process.env.FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

// Default 404
app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));

export default app;
