import { Router } from 'express';
const router = Router();

router.post('/ping', (req, res) => {
  console.log('DEBUG /api/debug/ping body:', req.body);
  res.status(200).json({ ok: true, now: new Date().toISOString(), body: req.body || null });
});

export default router;
