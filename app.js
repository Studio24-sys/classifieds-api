// app.js

import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';

const app = express();
app.use(express.json());

// Apply security headers middleware to all routes
app.use(setSecurityHeaders);

// Apply rate limiting middleware to specific routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// 🔎 Debug environment vars (temporary)
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasDb: !!process.env.DATABASE_URL,
    hasJwt: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || null,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Only listen locally, not on Vercel
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;