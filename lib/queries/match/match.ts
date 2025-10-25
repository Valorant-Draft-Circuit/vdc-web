import { prisma } from "@/lib/prisma";

export async function getMatch(id: string) {
  const match = await prisma.matches.findUnique({
    where: {
      matchID: Number(id),
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
