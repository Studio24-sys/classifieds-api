import { Router } from 'express';
const router = Router();

router.get('/hello', (req, res) => {
  res.json({ ok: true, msg: 'debug hello' });
});

router.post('/ping', (req, res) => {
  res.json({ ok: true, body: req.body ?? null });
});

export default router;
