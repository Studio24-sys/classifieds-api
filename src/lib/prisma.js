// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma = global._prisma;

/**
 * Lazy, crash-safe Prisma init.
 * - On Vercel (or when USE_PG_ADAPTER=1), use the pg driver adapter.
 * - Else (local), use default Prisma client.
 */
export function getPrisma() {
  if (prisma) return prisma;

  const usePgAdapter = process.env.VERCEL || process.env.USE_PG_ADAPTER === '1';

  if (usePgAdapter) {
    try {
      // Defer heavy imports to runtime to avoid boot crashes
      const pg = require('pg'); // dynamic require keeps edge cases away at import time
      const { PrismaPg } = require('@prisma/adapter-pg');

      const { Pool } = pg;

      const pooledUrl = process.env.DATABASE_URL;
      if (!pooledUrl) {
        throw new Error('DATABASE_URL is missing');
      }

      const pool = new Pool({
        connectionString: pooledUrl,
        max: 2,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
        ssl: { rejectUnauthorized: false },
      });

      const adapter = new PrismaPg(pool);
      prisma = new PrismaClient({ adapter });
    } catch (e) {
      // Fall back to plain client so the function still boots and we can see errors via /api/debug/env
      console.error('PG adapter bootstrap failed, falling back to plain Prisma:', e);
      prisma = new PrismaClient();
    }
  } else {
    prisma = new PrismaClient();
  }

  global._prisma = prisma;
  return prisma;
}

export default getPrisma();
