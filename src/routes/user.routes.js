import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!me) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(me);
});

export default router;
