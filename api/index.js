import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import authRouter  from '../src/routes/auth.routes.js';
import usersRouter from '../src/routes/user.routes.js';
import postsRouter from '../src/routes/posts.routes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// 🔐 Minimal auth middleware just for routes that need it
function authz(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'UNAUTHENTICATED' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: payload.userId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'MINIMAL express + routers alive' });
});

// Mount routers
app.use('/api/auth',  authRouter);
app.use('/api/users', usersRouter);

// ✅ Apply auth only to POSTs on /api/posts; GET stays public
app.use('/api/posts', (req, res, next) => {
  if (req.method === 'POST') return authz(req, res, next);
  return next();
}, postsRouter);

export default app;
