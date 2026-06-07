import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma, Tier } from "@prisma/client";

export type ActiveTeam = Prisma.TeamsGetPayload<{
  select: {
    id: true;
    name: true;
    Franchise: {
      select: {
        slug: true;
        Brand: {
          select: { logo: true };
        };
      };
    };
  };
}>;

export type TeamLogoInfo = {
  slug: string;
  tier: Tier;
  logoPath: string | null;
};

export type TeamLogoMap = Record<number, TeamLogoInfo | undefined>;

/**
 * Fetch all active teams in a given tier
 * @param tier
 * @returns All active teams in a given tier
 */
export async function getAllActiveTeamsIn(tier: Tier): Promise<ActiveTeam[]> {
  return prisma.teams.findMany({
    where: { tier, active: true },
    select: {
      id: true,
      name: true,
      Franchise: {
        select: {
          slug: true,
          Brand: {
            select: {
              logo: true,
            },
          },
        },
      },
    },
  });
}

export const getTeamLogoById = cache(
  async (id: number): Promise<TeamLogoInfo | null> => {
    const team = await prisma.teams.findFirst({
      where: { id },
      select: {
        tier: true,
        Franchise: {
          select: {
            slug: true,
            Brand: { select: { logo: true } },
          },
        },
      },
    });
    if (!team) return null;
    return {
      slug: team.Franchise.slug,
      tier: team.tier,
      logoPath: team.Franchise.Brand?.logo ?? null,
    };
  },
);

export async function getTeamLogoMap(
  teamIds: Iterable<number>,
): Promise<TeamLogoMap> {
  const uniqueIds = Array.from(new Set(teamIds));
  const entries = await Promise.all(
    uniqueIds.map(async (id) => [id, await getTeamLogoById(id)] as const),
  );
  const map: TeamLogoMap = {};
  for (const [id, info] of entries) {
    if (info) map[id] = info;
  }
  return map;
}
