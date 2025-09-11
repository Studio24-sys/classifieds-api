import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

// GET /api/posts  (paginated)
router.get('/', async (req, res) => {
  const take = Math.min(Math.max(parseInt(req.query.limit ?? '10', 10), 1), 50); // clamp 1..50
  const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
  const skip = (page - 1) * take;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      skip, take,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, email: true } } },
    }),
    prisma.post.count(),
  ]);

  res.json({
    page,
    limit: take,
    total,
    totalPages: Math.ceil(total / take),
    items,
  });
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, email: true } } },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// POST /api/posts
router.post(
  '/',
  requireAuth,
  requireFields(['title', 'content']),
  async (req, res) => {
    const { title, content } = req.body;
    const post = await prisma.post.create({
      data: { title, content, authorId: req.userId },
    });
    res.status(201).json(post);
  }
);

// PUT /api/posts/:id
router.put(
  '/:id',
  requireAuth,
  requireFields(['title', 'content']),
  async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.userId) return res.status(403).json({ error: 'Not your post' });

    const updated = await prisma.post.update({
      where: { id },
      data: { title, content },
    });
    res.json(updated);
  }
);

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.authorId !== req.userId) return res.status(403).json({ error: 'Not your post' });

  await prisma.post.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
