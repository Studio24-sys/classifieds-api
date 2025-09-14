// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRouter = require('./src/routes/auth.routes');
const postsRouter = require('./src/routes/posts.routes');
const usersRouter = require('./src/routes/user.routes'); // 👈 new line

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is alive' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter); // 👈 mount the users routes

// Error handling (optional)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'SERVER_ERROR' });
});

// Export for Vercel or start locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
