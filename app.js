// app.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import dns from 'node:dns';
import net from 'node:net';

import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';

// ---- Prisma client (uses DATABASE_URL by default) ----
import prisma from './src/lib/prisma.js';

// ---- PG (node-postgres) for direct connectivity probes ----
import pg from 'pg';
const { Pool } = pg;

// Prefer IPv4 first on Vercel to avoid IPv6-only DNS answers
dns.setDefaultResultOrder?.('ipv4first');

const app = express();

// ---------------------------------------------------------------------
// Core middleware
// ---------------------------------------------------------------------
app.use(express.json());
app.use(setSecurityHeaders);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', apiLimiter);

// ---------------------------------------------------------------------
// Basic routes
// ---------------------------------------------------------------------
app.get('/', (_req, res) => {
  res.type('text/plain').send('Welcome to the API');
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// ---------------------------------------------------------------------
// DEBUG: ENV summary (safe, no secrets)
// ---------------------------------------------------------------------
app.get('/api/debug/env', (_req, res) => {
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
      return { rawStartsWith: String(u).slice(0, 12) };
    }
  };

  res.json({
    nodeEnv: process.env.NODE_ENV || null,
    hasJwt: !!process.env.JWT_SECRET,
    dbParsed: redact(process.env.DATABASE_URL || ''),
    directParsed: redact(process.env.DIRECT_URL || ''),
    dbStartsWith: (process.env.DATABASE_URL || '').slice(0, 12) || null,
  });
});

// ---------------------------------------------------------------------
// DEBUG: Prisma ping (serverless-friendly query)
// ---------------------------------------------------------------------
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ---------------------------------------------------------------------
// DEBUG: DNS + TCP checks (helps diagnose host/port/DNS issues)
// ---------------------------------------------------------------------
app.get('/api/debug/dns', async (_req, res) => {
  const pooledUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';

  const pooledHost = (() => {
    try { return new URL(pooledUrl).hostname; } catch { return null; }
  })();
  const directHost = (() => {
    try { return new URL(directUrl).hostname; } catch { return null; }
  })();

  const pooledPort = (() => {
    try { return Number(new URL(pooledUrl).port) || 6543; } catch { return 6543; }
  })();
  const directPort = (() => {
    try { return Number(new URL(directUrl).port) || 5432; } catch { return 5432; }
  })();

  const resolveWrap = (host) =>
    new Promise((resolve) => {
      if (!host) return resolve([]);
      dns.resolve(host, (err, addrs) => resolve(err ? [{ error: String(err) }] : addrs.map(a => ({ address: a, family: a.includes(':') ? 6 : 4 }))));
    });

  const tcpProbe = (host, port, timeoutMs = 3000) =>
    new Promise((resolve) => {
      if (!host || !port) return resolve({ ok: false, error: 'missing host/port' });
      const socket = net.connect({ host, port, timeout: timeoutMs }, () => {
        socket.end();
        resolve({ ok: true });
      });
      socket.on('error', (err) => resolve({ ok: false, error: String(err) }));
      socket.on('timeout', () => {
        socket.destroy();
        resolve({ ok: false, error: 'timeout' });
      });
    });

  const [pooledDNS, directDNS] = await Promise.all([
    resolveWrap(pooledHost),
    resolveWrap(directHost),
  ]);

  const [pooledTCP, directTCP] = await Promise.all([
    tcpProbe(pooledHost, pooledPort),
    tcpProbe(directHost, directPort),
  ]);

  res.json({
    pooledHost,
    directHost,
    pooledDNS,
    pooledTCP6543: pooledTCP,
    directDNS,
    directTCP5432: directTCP,
  });
});

// ---------------------------------------------------------------------
// DEBUG: PG via DATABASE_URL (pooled)
// ---------------------------------------------------------------------
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL, // should be *.pooler.supabase.com:6543
  max: 2,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: { rejectUnauthorized: false },
});

app.get('/api/debug/pg', async (_req, res) => {
  try {
    const client = await pgPool.connect();
    try {
      const r = await client.query('SELECT 1 as ok');
      res.json({ ok: true, result: r.rows });
    } finally {
      client.release();
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ---------------------------------------------------------------------
// DEBUG: PG via DIRECT_URL (5432) — for comparison
// ---------------------------------------------------------------------
const pgDirectPool = new Pool({
  connectionString: process.env.DIRECT_URL, // should be db.<ref>.supabase.co:5432
  max: 2,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: { rejectUnauthorized: false },
});

app.get('/api/debug/pg-direct', async (_req, res) => {
  try {
    const client = await pgDirectPool.connect();
    try {
      const r = await client.query('SELECT 1 as ok');
      res.json({ ok: true, result: r.rows });
    } finally {
      client.release();
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ---------------------------------------------------------------------
// Business routes
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Vercel-friendly: export app; only listen locally
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
