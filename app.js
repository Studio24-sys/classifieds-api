// app.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import prisma from './src/lib/prisma.js';

import dns from 'node:dns/promises';
import net from 'node:net';
import pg from 'pg';

const app = express();

// -------- Core middleware --------
app.use(express.json());
app.use(setSecurityHeaders);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use('/api/', apiLimiter);

// -------- Root & health --------
app.get('/', (_req, res) => {
  res.type('text/plain').send('Welcome to the API');
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// -------- DEBUG: env (redacted) --------
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

// -------- DEBUG: DNS/TCP probe --------
app.get('/api/debug/dns', async (_req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
    const directUrl = process.env.DIRECT_URL ? new URL(process.env.DIRECT_URL) : null;

    const pooledHost = dbUrl?.hostname || null;
    const directHost = directUrl?.hostname || null;

    const out = {
      pooledHost,
      directHost,
      pooledDNS: [],
      pooledTCP6543: { ok: false, error: 'missing host/port' },
      directDNS: [],
      directTCP5432: { ok: false, error: 'missing host/port' },
    };

    // Resolve A/AAAA for pooled host
    if (pooledHost) {
      try {
        const [a, aaaa] = await Promise.allSettled([
          dns.resolve4(pooledHost),
          dns.resolve6(pooledHost),
        ]);
        if (a.status === 'fulfilled') out.pooledDNS.push(...a.value.map(ip => ({ address: ip, family: 4 })));
        if (aaaa.status === 'fulfilled') out.pooledDNS.push(...aaaa.value.map(ip => ({ address: ip, family: 6 })));
      } catch (e) {
        out.pooledDNS.push({ error: String(e) });
      }

      // Try TCP:6543 if present in URL or typical pooler port
      const port = Number(dbUrl.port || 6543);
      out.pooledTCP6543 = await new Promise((resolve) => {
        const socket = net.createConnection({ host: pooledHost, port, timeout: 4000 }, () => {
          socket.destroy();
          resolve({ ok: true });
        });
        socket.on('error', (err) => resolve({ ok: false, error: String(err) }));
        socket.on('timeout', () => { socket.destroy(); resolve({ ok: false, error: 'timeout' }); });
      });
    }

    // Resolve A/AAAA for direct host
    if (directHost) {
      try {
        const [a, aaaa] = await Promise.allSettled([
          dns.resolve4(directHost),
          dns.resolve6(directHost),
        ]);
        if (a.status === 'fulfilled') out.directDNS.push(...a.value.map(ip => ({ address: ip, family: 4 })));
        if (aaaa.status === 'fulfilled') out.directDNS.push(...aaaa.value.map(ip => ({ address: ip, family: 6 })));
      } catch (e) {
        out.directDNS.push({ error: String(e) });
      }

      // Try TCP:5432 for direct Postgres
      const port = Number(directUrl.port || 5432);
      out.directTCP5432 = await new Promise((resolve) => {
        const socket = net.createConnection({ host: directHost, port, timeout: 4000 }, () => {
          socket.destroy();
          resolve({ ok: true });
        });
        socket.on('error', (err) => resolve({ ok: false, error: String(err) }));
        socket.on('timeout', () => { socket.destroy(); resolve({ ok: false, error: 'timeout' }); });
      });
    }

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// -------- DEBUG: PG (node-postgres) probe --------
const { Pool } = pg;
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: { rejectUnauthorized: false }, // Neon/Supabase require SSL
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

// -------- DEBUG: Prisma ping --------
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// -------- Real app routes --------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// -------- Local dev listen; Vercel uses the default export --------
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
