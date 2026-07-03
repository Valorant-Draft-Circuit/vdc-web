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

export type TeamCardInfo = {
  name: string;
  tier: Tier;
  slug: string;
  logoPath: string | null;
};

export type TeamCardMap = Record<number, TeamCardInfo | undefined>;

export async function getTeamCardsByIds(
  teamIds: Iterable<number>,
): Promise<TeamCardMap> {
  const uniqueIds = Array.from(new Set(teamIds));
  if (uniqueIds.length === 0) return {};

  const teams = await prisma.teams.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      name: true,
      tier: true,
      Franchise: {
        select: {
          slug: true,
          Brand: { select: { logo: true } },
        },
      },
    },
  });

  const map: TeamCardMap = {};
  for (const team of teams) {
    map[team.id] = {
      name: team.name,
      tier: team.tier,
      slug: team.Franchise.slug,
      logoPath: team.Franchise.Brand?.logo ?? null,
    };
  }
  return map;
}

// Teams that actually played a given season+tier (from that season's Matches),
// regardless of current `active` flag - so past-season standings recompute correctly.
export async function getTeamsInSeason(
  tier: Tier,
  season: number,
): Promise<ActiveTeam[]> {
  const matches = await prisma.matches.findMany({
    where: { tier, season },
    select: { home: true, away: true },
  });
  const teamIds = new Set<number>();
  for (const m of matches) {
    if (m.home !== null) teamIds.add(m.home);
    if (m.away !== null) teamIds.add(m.away);
  }
  if (teamIds.size === 0) return [];
  return prisma.teams.findMany({
    where: { id: { in: Array.from(teamIds) } },
    select: {
      id: true,
      name: true,
      Franchise: { select: { slug: true, Brand: { select: { logo: true } } } },
    },
  });
}
