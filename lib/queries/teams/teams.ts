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
