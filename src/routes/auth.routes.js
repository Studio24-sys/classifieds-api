// src/routes/auth.routes.js (ESM)
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'VALIDATION' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'BAD_CREDENTIALS' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'BAD_CREDENTIALS' });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('LOGIN_ERR', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// POST /api/auth/request-reset
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: 'VALIDATION' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ ok: true }); // don't leak existence

    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt, used: false },
    });

    // In MVP we just return ok; you’ve been reading the token via psql
    res.json({ ok: true });
  } catch (err) {
    console.error('REQ_RESET_ERR', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body ?? {};
    if (!token || !newPassword) return res.status(400).json({ error: 'VALIDATION' });

    const row = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!row || row.used) return res.status(400).json({ error: 'BAD_TOKEN' });
    if (row.expiresAt < new Date()) return res.status(400).json({ error: 'EXPIRED' });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { password: hash } }),
      prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error('RESET_ERR', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
