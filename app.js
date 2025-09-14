// app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// --- CORS (lock to your frontend) ---
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: false,
}));

// --- Parsers ---
app.use(express.json());

// --- Routers ---
const authRouter = require('./src/routes/auth.routes');
const postsRouter = require('./src/routes/posts.routes');
const usersRouter = require('./src/routes/user.routes');

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);

// --- Health + simple debug ---
app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Server is alive' }));
app.get('/api/debug/db', async (_req, res) => {
  try {
    const ping = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: ping });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// --- 404 ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Error handler ---
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

// --- Start (for local only) ---
const PORT = process.env.PORT || 3005;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

module.exports = app;
