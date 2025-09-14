// src/routes/user.routes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/users/me
 * Returns the current user (id, email, name, createdAt)
 */
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(user);
  } catch (e) {
    console.error('GET /users/me error:', e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * GET /api/users/me/posts?page=&limit=
 * Lists posts authored by the current user (paginated)
 */
router.get('/me/posts', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
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
          // If your latest migration is deployed in prod, you can expose these:
          barrio: true,
          pricePyg: true,
          contactWhatsapp: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      items,
    });
  } catch (e) {
    console.error('GET /users/me/posts error:', e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;
