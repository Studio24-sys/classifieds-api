// src/services/auth.service.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret123';

export async function registerUser({ email, password, name }) {
  if (!email || !password) throw new Error('MISSING_FIELDS');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { const e = new Error('EMAIL_TAKEN'); e.code = 'EMAIL_TAKEN'; throw e; }
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, password: hash, name: name ?? null },
    select: { id: true, email: true, name: true, createdAt: true }
  });
}

export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error('MISSING_FIELDS');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { const e = new Error('INVALID_CREDENTIALS'); e.code = 'INVALID_CREDENTIALS'; throw e; }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) { const e = new Error('INVALID_CREDENTIALS'); e.code = 'INVALID_CREDENTIALS'; throw e; }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { token };
}

export async function resetPassword(email) { if (!email) throw new Error('MISSING_EMAIL'); return true; }
export async function verifyEmail(email) { if (!email) throw new Error('MISSING_EMAIL'); return true; }
