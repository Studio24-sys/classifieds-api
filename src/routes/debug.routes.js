import { Router } from 'express';
const router = Router();

router.get('/hello', (_req, res) => {
  res.json({ ok: true, msg: 'debug hello' });
});

router.post('/ping', (req, res) => {
  res.json({ ok: true, body: req.body ?? null });
});

export default router;
