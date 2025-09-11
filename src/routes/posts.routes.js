import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireBodyFields, optionalString } from '../middleware/validate.js';

const router = express.Router();

// GET /api/posts
router.get('/', async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, email: true } } },
  });
  res.json(posts);
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

// POST /api/posts (create)
router.post(
  '/',
  requireAuth,
  requireBodyFields(['title', 'content']),
  async (req, res) => {
    const { title, content } = req.body;
    const created = await prisma.post.create({
      data: { title, content, authorId: req.userId },
    });
    res.status(201).json(created);
  }
);

// PUT /api/posts/:id (update)
router.put(
  '/:id',
  requireAuth,
  optionalString('title', 300),
  optionalString('content', 5000),
  async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.userId) {
      return res.status(403).json({ error: 'NOT_OWNER' });
    }
    const data = {};
    if (typeof req.body.title === 'string') data.title = req.body.title;
    if (typeof req.body.content === 'string') data.content = req.body.content;
    const updated = await prisma.post.update({ where: { id }, data });
    res.json(updated);
  }
);

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.authorId !== req.userId) {
    return res.status(403).json({ error: 'NOT_OWNER' });
  }
  await prisma.post.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
