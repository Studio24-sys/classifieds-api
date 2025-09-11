import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import postRoutes from './src/routes/posts.routes.js';
import prisma from './src/lib/prisma.js';

const app = express();

// CORS (allow all origins for now; tighten later to your frontend domain)
app.use(cors({ origin: true, credentials: false }));

app.use(bodyParser.json());

// Global tiny limiter on everything (bursty protection)
const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 });
app.use(globalLimiter);

// Tighter limiter on auth routes (brute-force protection)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use('/api/auth', authLimiter);

// Optional: tighter limiter on write actions
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(['/api/posts'], writeLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// Debug DB (Prisma)
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Local dev vs Vercel
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
