import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = Router();

// GET /api/posts
router.get('/', async (req, res) => {
  const page  = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const items = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, email: true } } },
  });
  const total = await prisma.post.count();
  res.json({ page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), items });
});

// POST /api/posts (needs auth middleware before if you use one)
router.post('/', async (req, res) => {
  try {
    const { title, content, barrio, pricePyg, contactWhatsapp } = req.body ?? {};
    if (!title || !content) return res.status(400).json({ error: 'MISSING_FIELDS' });

    // userId comes from your auth middleware (req.auth.userId) or similar
    const userId = req.auth?.userId || req.userId || req.body.userId; // adapt to your jwt middleware
    if (!userId) return res.status(401).json({ error: 'UNAUTHENTICATED' });

    const post = await prisma.post.create({
      data: { title, content, barrio, pricePyg, contactWhatsapp, authorId: userId },
    });
    res.status(201).json(post);
  } catch (e) {
    console.error('POST /api/posts error:', e);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
