// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

let prismaSingleton = null;

/**
 * Returns a Prisma client.
 * On Vercel, if USE_PG_ADAPTER=1, use the Prisma PG driver adapter.
 * Otherwise, use the default Prisma engine.
 */
export function getPrisma() {
  if (prismaSingleton) return prismaSingleton;

  const useAdapter = process.env.USE_PG_ADAPTER === '1';

  if (useAdapter) {
    // Lazy-require adapter + pg only when asked for
    // (avoids crashing /api/health at cold start)
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { PrismaPg } = require('@prisma/adapter-pg');
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const pg = require('pg');
    const { Pool } = pg;

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is missing');
    }

    const pool = new Pool({
      connectionString,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ssl: { rejectUnauthorized: false },
    });

    const adapter = new PrismaPg(pool);
    prismaSingleton = new PrismaClient({ adapter });
  } else {
    prismaSingleton = new PrismaClient();
  }

  return prismaSingleton;
}
