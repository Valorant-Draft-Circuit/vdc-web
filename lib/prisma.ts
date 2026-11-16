import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Normally set by instrumentation.ts at startup; created here only as a fallback.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

// Shared in production too: the build contains several copies of this module,
// and each copy would otherwise hold its own connection pool.
globalForPrisma.prisma = prisma;