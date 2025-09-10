// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// Use the pooled (6543) URL in production.
// We'll flip to the driver adapter automatically on Vercel or if USE_PG_ADAPTER=1.
const pooledUrl = process.env.DATABASE_URL;

let prisma = global._prisma;

if (!prisma) {
  if (process.env.VERCEL || process.env.USE_PG_ADAPTER === '1') {
    // node-postgres pool
    const pool = new Pool({
      connectionString: pooledUrl,
      max: 2, // small for serverless
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    // Local dev: normal client (uses DATABASE_URL too)
    prisma = new PrismaClient();
  }
  global._prisma = prisma;
}

export default prisma;
