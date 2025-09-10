// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

function createClient() {
  // Keep logs quiet in prod, verbose in dev
  const log =
    process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['error'];
  return new PrismaClient({ log });
}

// Reuse a single instance across hot-reloads/serverless invocations
const globalAny = globalThis;

// If already created, reuse it; otherwise create and cache on global
const prisma =
  globalAny.__PRISMA_CLIENT__ || (globalAny.__PRISMA_CLIENT__ = createClient());

// Named + default exports so BOTH styles work:
//   import prisma from '../lib/prisma.js'
//   import { prisma, getPrisma } from '../lib/prisma.js'
export { prisma };
export function getPrisma() {
  return prisma;
}
export default prisma;
