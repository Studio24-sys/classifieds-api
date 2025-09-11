import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

// List posts (public)
router.get('/', async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, email: true } } },
  });
  res.json(posts);
});

// Get one post by id (public)
router.get('/:id', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, email: true } } },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Create post (auth)
router.post('/', requireAuth, requireFields(['title', 'content']), async (req, res) => {
  const { title, content } = req.body;
  const created = await prisma.post.create({
    data: { title, content, authorId: req.userId },
  });
  res.status(201).json(created);
});

// Update post (auth + owner)
router.put('/:id', requireAuth, requireFields(['title', 'content']), async (req, res) => {
  const { id } = req.params;
  const found = await prisma.post.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: 'Post not found' });
  if (found.authorId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

  const updated = await prisma.post.update({
    where: { id },
    data: { title: req.body.title, content: req.body.content },
  });
  res.json(updated);
});

// Delete post (auth + owner)
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const found = await prisma.post.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: 'Post not found' });
  if (found.authorId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

  await prisma.post.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
