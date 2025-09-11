import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { requireBodyFields } from '../middleware/validate.js';

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  requireBodyFields(['email', 'password']),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ error: 'EMAIL_TAKEN' });

      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hash },
        select: { id: true, email: true, name: true, createdAt: true },
      });

      res.status(201).json(user);
    } catch (e) {
      res.status(500).json({ error: 'Registration failed', detail: String(e) });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  requireBodyFields(['email', 'password']),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.json({ token });
    } catch (e) {
      res.status(500).json({ error: 'Login failed', detail: String(e) });
    }
  }
);

export default router;
