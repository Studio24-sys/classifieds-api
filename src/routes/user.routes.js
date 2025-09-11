// src/routes/user.routes.js
import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'ME_FAILED', detail: String(e) });
  }
});

export default router;
