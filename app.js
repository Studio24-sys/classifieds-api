// app.js

import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './src/middleware/securityHeadersMiddleware.js';
import limiter from './src/middleware/rateLimitMiddleware.js';
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

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Welcome to the API' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});
app.use('/api/', apiLimiter);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;

// Only listen when running locally
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel serverless
export default app;