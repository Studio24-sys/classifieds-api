// GET /api/posts (public list) — hotfix
app.get('/api/posts', async (req, res) => {
  try {
    const { PrismaClient } = await import('../src/prisma/client.js').catch(async () => {
      // fallback if you import @prisma/client directly elsewhere
      const { PrismaClient } = await import('@prisma/client'); 
      return { PrismaClient };
    });
    const prisma = new PrismaClient();

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, email: true } } },
      }),
      prisma.post.count(),
    ]);

    res.json({ page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), items });
  } catch (err) {
    console.error('GET /api/posts hotfix error:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});
