import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'MINIMAL server is alive' });
});

app.get('/api/_whoami', (req, res) => {
  res.json({
    node: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV || null,
      PORT: process.env.PORT || null,
    },
  });
});

export default app;
