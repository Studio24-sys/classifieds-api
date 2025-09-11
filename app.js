// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';

import { Pool } from 'pg';
import prisma from './src/lib/prisma.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- health check ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// --- debug env ---
app.get('/api/debug/env', (_req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasJwt: !!process.env.JWT_SECRET,
    dbUrlStartsWith: process.env.DATABASE_URL?.slice(0, 12),
  });
});

// --- debug raw PG ---
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get('/api/debug/pg', async (_req, res) => {
  try {
    const r = await pgPool.query('SELECT 1 as ok');
    res.json({ ok: true, result: r.rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// --- debug prisma ---
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// --- auth + users routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- serverless export for Vercel ---
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
