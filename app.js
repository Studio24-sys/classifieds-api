// app.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';

// Prisma (used by /api/debug/db)
import prisma from './src/lib/prisma.js';

// Extra debug tooling
import dns from 'node:dns/promises';
import net from 'node:net';
import pg from 'pg';
const { Pool } = pg;

const app = express();

// ---------- Core middleware ----------
app.use(express.json());
app.use(setSecurityHeaders);

// basic rate limit on all API routes
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// ---------- Simple root + health ----------
app.get('/', (_req, res) => {
  res.type('text/plain').send('Welcome to the API');
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// ---------- DEBUG HELPERS ----------

// /api/debug/env — shows parsed env WITHOUT secrets
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

// raw TCP connect helper
function canConnectTCP(host, port, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (ok, err) => {
      try { socket.destroy(); } catch {}
      resolve({ ok, error: err ? String(err) : null });
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true, null));
    socket.once('timeout', () => done(false, new Error('timeout')));
    socket.once('error', (e) => done(false, e));
    socket.connect(port, host);
  });
}

// /api/debug/dns — DNS + TCP checks for pooled(6543) and direct(5432)
app.get('/api/debug/dns', async (_req, res) => {
  try {
    const parse = (u) => {
      try {
        const url = new URL(u);
        return { host: url.hostname };
      } catch {
        return null;
      }
    };

    const pooled = parse(process.env.DATABASE_URL || '');
    const direct = parse(process.env.DIRECT_URL || '');
    const out = {
      pooledHost: pooled?.host || null,
      directHost: direct?.host || null,
    };

    if (pooled?.host) {
      try {
        const addrs = await dns.lookup(pooled.host, { all: true });
        out.pooledDNS = addrs.map((a) => ({ address: a.address, family: a.family }));
      } catch (e) {
        out.pooledDNS = { error: String(e) };
      }
      out.pooledTCP6543 = await canConnectTCP(pooled.host, 6543);
    }

    if (direct?.host) {
      try {
        const addrs = await dns.lookup(direct.host, { all: true });
        out.directDNS = addrs.map((a) => ({ address: a.address, family: a.family }));
      } catch (e) {
        out.directDNS = { error: String(e) };
      }
      out.directTCP5432 = await canConnectTCP(direct.host, 5432);
    }

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// /api/debug/pg — try node-postgres against DATABASE_URL (pooled 6543)
app.get('/api/debug/pg', async (_req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false },
  });
  try {
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

// /api/debug/pg-direct — try node-postgres against DIRECT_URL (5432)
app.get('/api/debug/pg-direct', async (_req, res) => {
  const pool = new Pool({
    connectionString: process.env.DIRECT_URL,
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false },
  });
  try {
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

// /api/debug/db — Prisma ping (uses whatever prisma is configured to use)
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ---------- Mount your real routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ---------- Vercel-friendly export ----------
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
export default app;
