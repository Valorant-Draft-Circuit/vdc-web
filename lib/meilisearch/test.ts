import { prisma } from "@/prisma/prismadb";

export async function getDocuments() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      Team: {
        select: {
          name: true,
          tier: true,
          Franchise: { select: { Brand: true } },
        },
      },
      Accounts: { where: { provider: `discord` } },
      PrimaryRiotAccount: { select: { MMR: true, riotIGN: true } },
      Status: true,
    },
  });
}
