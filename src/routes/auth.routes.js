import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', requireFields(['email', 'password']), async (req, res) => {
  const { email, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'EMAIL_TAKEN' });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.status(201).json(user);
});

// POST /api/auth/login
router.post('/login', requireFields(['email', 'password']), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const token = signToken(user.id);
  res.json({ token });
});

// POST /api/auth/request-reset
router.post('/request-reset', requireFields(['email']), async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always 200 (don't leak)
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    // TODO: send an email with link:
    // `${process.env.FRONTEND_ORIGIN}/reset?token=${token}`
  }
  res.json({ ok: true });
});

// POST /api/auth/reset
router.post('/reset', requireFields(['token', 'password']), async (req, res) => {
  const { token, password } = req.body;
  const t = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!t || t.used || t.expiresAt < new Date()) {
    return res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: t.userId }, data: { password: hash } }),
    prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
  ]);
  res.json({ ok: true });
});

export default router;
