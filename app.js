import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// load env
dotenv.config();

const app = express();

// ---------- CORS CONFIG ----------
const allowed = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);              // allow curl/vercel/health
    if (allowed.includes(origin)) return cb(null, true);
    return cb(null, false);                          // deny silently, no crash
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// ----------------------------------

// logging
app.use(morgan('dev'));
app.use(express.json());

// health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// routes
import postsRoutes from './src/routes/posts.routes.js';
import authRoutes from './src/routes/auth.routes.js';
app.use('/api/posts', postsRoutes);
app.use('/api/auth', authRoutes);

// export for vercel
export default app;

// local dev listener
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
