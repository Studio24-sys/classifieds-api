// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth'); // <- verifies JWT and sets req.user.userId

// GET /api/users/me  -> current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'UNAUTHORIZED' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    return res.json(user);
  } catch (err) {
    console.error('GET /users/me error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// GET /api/users/me/posts?page=1&limit=10 -> current user's posts (paginated)
router.get('/me/posts', auth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'UNAUTHORIZED' });

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          barrio: true,
          pricePyg: true,
          contactWhatsapp: true,
          createdAt: true,
        },
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    return res.json({ page, limit, total, totalPages, items });
  } catch (err) {
    console.error('GET /users/me/posts error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;
