import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import postRoutes from './src/routes/posts.routes.js';
import prisma from './src/lib/prisma.js';

const app = express();

// ----- CORS (locked to your frontend origin or allow no-origin like curl) -----
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://your-frontend.example.com';

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/postman
    if (origin === FRONTEND_ORIGIN) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: false,
}));

app.use(bodyParser.json());

// ----- Rate limits -----
const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 });
app.use(globalLimiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use('/api/auth', authLimiter);

const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(['/api/posts'], writeLimiter);

// ----- Health -----
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// ----- Debug DB (Prisma) -----
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ----- Routes -----
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
