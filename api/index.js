import express from 'express';
import cors from 'cors';

// ⬇️ real routers (these must export `default`)
import authRouter  from '../src/routes/auth.routes.js';
import usersRouter from '../src/routes/user.routes.js';
import postsRouter from '../src/routes/posts.routes.js';

const app = express();

// CORS + body parser (POST needed this)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Health/debug
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server + real routers alive' });
});

// Real API
app.use('/api/auth',  authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

export default app;
