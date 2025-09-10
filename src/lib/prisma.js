// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

function createClient() {
  const log = process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'];
  return new PrismaClient({ log });
}

const g = globalThis;
const prisma = g.__PRISMA__ || (g.__PRISMA__ = createClient());

export { prisma };
export function getPrisma() { return prisma; }
export default prisma;
