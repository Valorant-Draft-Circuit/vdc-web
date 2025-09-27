import { prisma } from "@/prisma/prismadb";
import { LeagueStatus } from "@prisma/client";

export async function getContractsData() {
    const contracts = await prisma.user.findMany({
    where: {
      OR: [
        {
          Status: {
            contractStatus: { not: null },
          },
        },
        {
          Status: {
            leagueStatus: { in: [LeagueStatus.FREE_AGENT, LeagueStatus.DRAFT_ELIGIBLE, LeagueStatus.RESTRICTED_FREE_AGENT] },
          },
        },
      ],
    },
    include: {
      Status: true,
      Team: {
        include: {
          Franchise: true,
        },
      },
      PrimaryRiotAccount: {
        include: {
          MMR: true,
        },
      },
    },
  })
  return contracts;
}