// src/routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';

const router = express.Router();

// tiny helpers
const requireBody = (obj, keys) => {
  for (const k of keys) if (!obj?.[k]) return `Missing field: ${k}`;
  return null;
};
const isStrong = (pwd) =>
  typeof pwd === 'string' && pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const err = requireBody(req.body, ['email', 'password']);
    if (err) return res.status(400).json({ error: err });
    const { email, password } = req.body;

    if (!isStrong(password)) {
      return res.status(400).json({ error: 'WEAK_PASSWORD' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'EMAIL_TAKEN' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return res.status(201).json(user);
  } catch (e) {
    return res.status(500).json({ error: 'REGISTER_FAILED', detail: String(e) });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const err = requireBody(req.body, ['email', 'password']);
    if (err) return res.status(400).json({ error: err });
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'BAD_CREDENTIALS' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'BAD_CREDENTIALS' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });

    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'LOGIN_FAILED', detail: String(e) });
  }
});

// POST /api/auth/request-reset
router.post('/request-reset', async (req, res) => {
  try {
    const err = requireBody(req.body, ['email']);
    if (err) return res.status(400).json({ error: err });
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return ok (don’t leak whether email exists)
    if (!user) return res.json({ ok: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // In production you’d email a link:
    // `${process.env.FRONTEND_ORIGIN}/reset?token=${token}`
    // For now we DON’T return it; you can fetch via psql like you did.

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'REQUEST_RESET_FAILED', detail: String(e) });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const err = requireBody(req.body, ['token', 'newPassword']);
    if (err) return res.status(400).json({ error: err });

    const { token, newPassword } = req.body;
    if (!isStrong(newPassword)) {
      return res.status(400).json({ error: 'WEAK_PASSWORD' });
    }

    const row = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!row) return res.status(400).json({ error: 'BAD_TOKEN' });
    if (row.used) return res.status(400).json({ error: 'TOKEN_USED' });
    if (new Date(row.expiresAt) < new Date()) return res.status(400).json({ error: 'TOKEN_EXPIRED' });

    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { password: hash } }),
      prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
    ]);

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'RESET_FAILED', detail: String(e) });
  }
});

export default router;
