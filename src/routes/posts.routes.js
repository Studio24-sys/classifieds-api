import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// GET / (existing) … keep as you have it

// CREATE post (hardened)
router.post('/', async (req, res) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { title, content, barrio, pricePyg, contactWhatsapp } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'MISSING_FIELDS', fields: ['title', 'content'] });
    }

    const data = {
      title: String(title).slice(0, 200),
      content: String(content).slice(0, 10000),
      authorId: req.auth.userId,
    };

    if (barrio) data.barrio = String(barrio).slice(0, 100);

    if (pricePyg !== undefined && pricePyg !== null && String(pricePyg).trim() !== '') {
      const n = Number(pricePyg);
      if (Number.isFinite(n) && n >= 0) data.pricePyg = Math.trunc(n);
    }

    if (contactWhatsapp) {
      // keep only digits, trim to reasonable length
      const digits = String(contactWhatsapp).replace(/\D/g, '').slice(0, 20);
      if (digits) data.contactWhatsapp = digits;
    }

    const created = await prisma.post.create({ data });
    return res.status(201).json(created);
  } catch (e) {
    console.error('POST /api/posts error:', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR', detail: e?.message || 'unknown' });
  }
});

export default router;
