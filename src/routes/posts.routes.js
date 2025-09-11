import express from 'express';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware: check JWT
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

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await prisma.post.create({
      data: { title, content, authorId: req.userId },
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post', detail: String(err) });
  }
});

// List posts
router.get('/', async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { id: true, email: true } } },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list posts', detail: String(err) });
  }
});

export default router;
