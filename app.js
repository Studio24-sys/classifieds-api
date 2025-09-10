// app.js
import express from 'express';
import rateLimit from 'express-rate-limit';

// ---- tiny in-file security headers (keeps it simple for now)
function setSecurityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}

const app = express();
app.use(express.json());
app.use(setSecurityHeaders);

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// Root + health
app.get('/', (_req, res) => res.type('text/plain').send('Welcome to the API (safe-boot)'));
app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Server is alive (safe-boot)' }));

// ---------- DEBUG: env (no secrets)
app.get('/api/debug/env', (req, res) => {
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

// ---------- DEBUG: raw PG probe (no Prisma)
app.get('/api/debug/pg', async (_req, res) => {
  try {
    const { Pool } = await import('pg');      // lazy import to avoid boot crash
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
      await pool.end();
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ---------- DEBUG: Prisma ping (lazy-load prisma to avoid boot crash)
app.get('/api/debug/db', async (_req, res) => {
  try {
    const { default: prisma } = await import('./src/lib/prisma.js');
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// NOTE: do NOT mount auth/user routes yet; we’re confirming boot first
// import authRoutes from './src/routes/auth.routes.js';
// import userRoutes from './src/routes/user.routes.js';
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Safe-boot server http://localhost:${PORT}`));
}

export default app;
