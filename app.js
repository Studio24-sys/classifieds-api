import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './src/routes/user.routes.js';
import postRoutes from './src/routes/posts.routes.js';
import prisma from './src/lib/prisma.js';

const app = express();
app.use(bodyParser.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// Debug DB (Prisma)
app.get('/api/debug/db', async (_req, res) => {
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result: r });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Routes
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
