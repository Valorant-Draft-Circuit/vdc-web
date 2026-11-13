import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "healthy" });
  } catch (error) {
    console.error("[health] database check failed", error);
    return Response.json({ status: "unhealthy" }, { status: 503 });
  }
}
