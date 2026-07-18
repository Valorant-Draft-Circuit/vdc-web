import { prisma } from "@/lib/prisma";

export type MatchDetail = NonNullable<Awaited<ReturnType<typeof getMatch>>>;
export type MatchTeam = NonNullable<MatchDetail["Home"]>;

export async function getMatch(id: string) {
  const matchId = Number(id);
  if (!Number.isInteger(matchId)) return null;
  const match = await prisma.matches.findUnique({
    where: {
      matchID: matchId,
    },
    include: {
      Home: {
        include: {
          Franchise: { select: { Brand: true, slug: true } },
        },
      },
      Away: {
        include: {
          Franchise: { select: { Brand: true, slug: true } },
        },
      },
      MapBans: true,
      Games: true,
    },
  });
  return match;
}
