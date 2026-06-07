import { cache } from "react";
import { Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TeamLogoInfo = {
  slug: string;
  tier: Tier;
  logoPath: string | null;
};

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

export type TeamLogoMap = Record<number, TeamLogoInfo | undefined>;

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
