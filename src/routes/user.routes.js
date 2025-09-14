import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { requireAuth } from '../utils/requireAuth.js';

const router = Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, createdAt: true },
  });
  if (!me) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(me);
});

// GET /api/users/me/posts
router.get('/me/posts', requireAuth, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { authorId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

export default router;
