// app.js

import express from 'express';
import rateLimit from 'express-rate-limit';
import setSecurityHeaders from './middleware/securityHeadersMiddleware.js';
import limiter from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Apply security headers middleware to all routes
app.use(setSecurityHeaders);

// Apply rate limiting middleware to specific routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});