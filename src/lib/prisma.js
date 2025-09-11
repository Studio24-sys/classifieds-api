// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

// singleton in dev to avoid hot-reload multiple clients
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

export default prisma;
