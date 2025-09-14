import { Router } from 'express';
import prisma from '../prisma/client.js'; // your prisma singleton path
import { authMiddleware } from '../middleware/auth.js'; // whatever you use to set req.user

const router = Router();

// List posts (existing)
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, email: true } } },
      }),
      prisma.post.count(),
    ]);

    res.json({
      page, limit, total, totalPages: Math.ceil(total / limit), items,
    });
  } catch (err) {
    next(err);
  }
});

// CREATE post (new)
router.post('/', authMiddleware, async (req, res, next) => {
  const t0 = Date.now();
  console.log('POST /api/posts start', { userId: req.user?.id, body: req.body });

  try {
    const { title, content, barrio, pricePyg, contactWhatsapp } = req.body || {};

    if (!title || !content) {
      console.log('POST /api/posts 400 missing fields');
      return res.status(400).json({ error: 'TITLE_AND_CONTENT_REQUIRED' });
    }

    // OPTIONAL: super quick anti-spam placeholder (no network calls!)
    // if (String(content).toLowerCase().includes('escort')) {
    //   return res.status(400).json({ error: 'BLOCKED_KEYWORD' });
    // }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        barrio: barrio ?? null,
        pricePyg: typeof pricePyg === 'number' ? pricePyg : null,
        contactWhatsapp: contactWhatsapp ?? null,
        authorId: req.user.id,
      },
      select: { id: true, title: true, content: true, authorId: true, createdAt: true },
    });

    console.log('POST /api/posts ok', { ms: Date.now() - t0, id: post.id });
    return res.status(201).json(post);
  } catch (err) {
    console.error('POST /api/posts error', { ms: Date.now() - t0, err });
    next(err);
  }
});

export default router;
