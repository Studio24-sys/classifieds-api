// src/routes/posts.routes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ---------- PUBLIC: list posts ----------
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, email: true } } },
      }),
      prisma.post.count(),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      items,
    });
  } catch (err) {
    console.error('GET /api/posts error:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// ---------- AUTH’D ONLY: create post ----------
router.post('/', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'UNAUTHENTICATED' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { title, content, barrio, pricePyg, contactWhatsapp } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        barrio: barrio ?? null,
        pricePyg: typeof pricePyg === 'number' ? pricePyg : null,
        contactWhatsapp: contactWhatsapp ?? null,
        author: { connect: { id: payload.userId } },
      },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error('POST /api/posts error:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
