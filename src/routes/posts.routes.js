import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { requireAuth } from '../utils/requireAuth.js';

const router = Router();

// GET /api/posts?page=1&limit=10
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? '10', 10), 1), 50);
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, email: true } } },
    }),
  ]);

  res.json({
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    items,
  });
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, email: true } } },
  });
  if (!post) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(post);
});

// POST /api/posts (auth)
router.post('/', requireAuth, async (req, res) => {
  const { title, content, barrio, pricePyg, contactWhatsapp } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'VALIDATION', details: 'title and content are required' });
  }

  const newPost = await prisma.post.create({
    data: {
      title,
      content,
      barrio: barrio ?? null,
      pricePyg: typeof pricePyg === 'number' ? pricePyg : null,
      contactWhatsapp: contactWhatsapp ?? null,
      authorId: req.userId,
    },
  });
  res.status(201).json(newPost);
});

// PUT /api/posts/:id (auth; own posts)
router.put('/:id', requireAuth, async (req, res) => {
  const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
  if (existing.authorId !== req.userId) return res.status(403).json({ error: 'FORBIDDEN' });

  const { title, content, barrio, pricePyg, contactWhatsapp } = req.body;
  const updated = await prisma.post.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(barrio !== undefined ? { barrio } : {}),
      ...(pricePyg !== undefined ? { pricePyg } : {}),
      ...(contactWhatsapp !== undefined ? { contactWhatsapp } : {}),
    },
  });
  res.json(updated);
});

// DELETE /api/posts/:id (auth; own posts)
router.delete('/:id', requireAuth, async (req, res) => {
  const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
  if (existing.authorId !== req.userId) return res.status(403).json({ error: 'FORBIDDEN' });

  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
