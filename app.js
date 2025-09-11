// app.js
import express from 'express';
import rateLimit from 'express-rate-limit';

import prisma from './src/lib/prisma.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import postRoutes from './src/routes/posts.routes.js';

const app = express();

// Body parsing
app.use(express.json());

// Tiny global rate limit (optional but nice)
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Root (optional)
app.get('/', (_req, res) => res.type('text/plain').send('API is up'));

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// Debug: Prisma ping
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Vercel-friendly: only listen locally
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
