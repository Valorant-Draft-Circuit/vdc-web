import { getMMRTierLines } from "@/lib/common/utils";
import { prisma } from "@/prisma/prismadb";
import { LeagueStatus, Tier } from "@prisma/client";
import { addDays, format, subDays } from "date-fns";

export async function getNewPlayerCount() {
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: subDays(new Date(), 30),
      },
    },
    select: {
      createdAt: true,
    },
  });

  const grouped = users.reduce((acc, user) => {
    const date = user.createdAt.toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return grouped;
}

export async function getSignedPlayerCount() {
  const playerCount = await prisma.user.count({
    where: {
      Status: { contractStatus: LeagueStatus.SIGNED },
    },
  });
  return playerCount;
}

export async function getSignedPlayerCountByTier(tier: Tier) {
  return await prisma.user.count({
    where: {
      Status: { contractStatus: LeagueStatus.SIGNED },
      Team: {
        tier: tier,
      },
    },
  });
}

export async function getFreeAgentCountByTier(
  faType: LeagueStatus,
  tier: Tier
) {
  const { PROSPECT, APPRENTICE, EXPERT } = await getMMRTierLines();

  let mmrRange;
  switch (tier) {
    case Tier.PROSPECT:
      mmrRange = { lte: PROSPECT.max };
      break;
    case Tier.APPRENTICE:
      mmrRange = {
        gt: PROSPECT.max,
        lte: APPRENTICE.max,
      };
      break;
    case Tier.EXPERT:
      mmrRange = {
        gt: APPRENTICE.max,
        lte: EXPERT.max,
      };
      break;
    case Tier.MYTHIC:
      mmrRange = { gt: EXPERT.max };
      break;
    default:
      throw new Error(`Invalid tier: ${tier}`);
  }

  const count = await prisma.user.count({
    where: {
      Status: {
        leagueStatus: faType,
      },
      PrimaryRiotAccount: {
        MMR: {
          mmrEffective: mmrRange,
        },
      },
    },
  });

  return count;
}

export async function getRestrictedFreeAgentCount() {
  return await prisma.user.count({
    where: {
      Status: { leagueStatus: LeagueStatus.RESTRICTED_FREE_AGENT },
    },
  });
}

export async function getTotalFreeAgentCount() {
  return await prisma.user.count({
    where: {
      OR: [
        { Status: { leagueStatus: LeagueStatus.RESTRICTED_FREE_AGENT } },
        { Status: { leagueStatus: LeagueStatus.FREE_AGENT } },
      ],
    },
  });
}

export async function getTotalPlayerCountOver(days) {
  const today = new Date();
  const startDate = subDays(today, days);

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        lte: today,
      },
    },
    select: { createdAt: true },
  });

  const dateList: string[] = [];
  for (let i = 0; i <= days; i++) {
    dateList.push(format(addDays(startDate, i), "yyyy-MM-dd"));
  }

  const counts: { date: string; total: number }[] = [];

  for (const date of dateList) {
    const count = users.filter((u) => u.createdAt <= new Date(date)).length;
    counts.push({ date, total: count });
  }
}
