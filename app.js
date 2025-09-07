// app.js
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import prisma from './src/lib/prisma.js';

const app = express();
app.use(express.json());

// security + rate limit
app.use(setSecurityHeaders);
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// 🔎 DEBUG: confirm DB connectivity
app.get('/api/debug/db', async (_req, res) => {
  try {
    const [row] = await prisma.$queryRaw`select version()`;
    res.json({ ok: true, version: row?.version ?? null });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// local only listener
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;