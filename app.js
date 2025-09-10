// app.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import { getPrisma } from './src/lib/prisma.js'; // ✅ lazy adapter import

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

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// ---------- DEBUG HELPERS ----------
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

// ✅ New: DB debug with pg adapter or Prisma fallback
app.get('/api/debug/db', async (_req, res) => {
  try {
    const prisma = getPrisma();
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});
// ----------------------------------

// Routes
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
