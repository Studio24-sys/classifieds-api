import express from 'express';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ---- Auth middleware (JWT) ----
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// ---- Create post (owner = current user) ----
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title is required' });

    const post = await prisma.post.create({
      data: { title, content: content ?? '', authorId: req.userId },
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post', detail: String(err) });
  }
});

// ---- List posts (public) ----
router.get('/', async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, email: true } } },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list posts', detail: String(err) });
  }
});

// ---- Get a single post by id (public) ----
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, email: true } } },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get post', detail: String(err) });
  }
});

// ---- Update a post (owner only) ----
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body || {};
    const id = req.params.id;

    // Ensure it exists and belongs to user
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Post not found' });
    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not your post' });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post', detail: String(err) });
  }
});

// ---- Delete a post (owner only) ----
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    // Ensure it exists and belongs to user
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Post not found' });
    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not your post' });
    }

    await prisma.post.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post', detail: String(err) });
  }
});

export default router;
