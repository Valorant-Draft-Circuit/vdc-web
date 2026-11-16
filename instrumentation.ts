/**
 * Runs once when the server starts, before any request. Creating the database
 * client here and parking it on globalThis means every bundle copy of
 * lib/prisma.ts and prisma/prismadb.js reuses this one client (and its one
 * connection pool) instead of each opening its own.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { PrismaClient } = await import("@prisma/client");
  const scope = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };
  scope.prisma ??= new PrismaClient({ log: ["warn", "error"] });
}