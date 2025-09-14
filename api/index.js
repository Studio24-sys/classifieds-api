import express from 'express';
import cors from 'cors';
import debugRouter from '../src/routes/debug.routes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server + debug alive' });
});

app.use('/api/debug', debugRouter);

export default app;
