// app.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';

const app = express();

// Body parsing
app.use(express.json());

// Security headers
app.use(setSecurityHeaders);

// Basic rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15m
  max: 100,
});
app.use('/api/', apiLimiter);

// Root
app.get('/', (_req, res) => {
  res.type('text/plain').send('Welcome to the API');
});

// Health — MUST NOT TOUCH DB
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// ---------- DEBUG HELPERS (NO CRASH ON STARTUP) ----------
app.get('/api/debug/env', (_req, res) => {
  try {
    const db = process.env.DATABASE_URL || '';
    const dir = process.env.DIRECT_URL || '';
    const redact = (u) => {
      if (!u) return null;
      try {
        const url = new URL(u);
        return {
          protocol: url.protocol.replace(':', ''),
          host: url.host,
          pathname: url.pathname,
          hasSSLMode: url.search.includes('sslmode='),
        };
      } catch {
        return { rawStartsWith: u.slice(0, 12) };
      }
    };
    res.json({
      nodeEnv: process.env.NODE_ENV || null,
      hasJwt: !!process.env.JWT_SECRET,
      dbParsed: redact(db),
      directParsed: redact(dir),
      dbStartsWith: db ? db.slice(0, 12) : null,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// DB ping (lazy import so startup never crashes)
app.get('/api/debug/db', async (_req, res) => {
  try {
    const { getPrisma } = await import('./src/lib/prisma.js'); // lazy
    const prisma = getPrisma();
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Optional: direct pg probe (also lazy, safe to keep)
// Shows if Node can open a socket to the DB host/port
app.get('/api/debug/pg', async (_req, res) => {
  try {
    const pg = await import('pg');
    const { Pool } = pg.default ?? pg;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ssl: { rejectUnauthorized: false },
    });
    const client = await pool.connect();
    try {
      const r = await client.query('SELECT 1 as ok');
      res.json({ ok: true, result: r.rows });
    } finally {
      client.release();
      pool.end();
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});
// --------------------------------------------------------

// Mount routes (these may use Prisma internally via their files)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Vercel-friendly
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
