import { SearchType } from "@/app/player/page";
import { prisma } from "@/prisma/prismadb";
import { LeagueStatus, Prisma, Tier } from "@prisma/client";

const ITEMS_PER_PAGE = 6;

export type TUserWithStats = Prisma.UserGetPayload<{
  select: {
    name: true;
    Team: {
      select: {
        Franchise: {
          select: {
            name: true;
            Brand: true;
          };
        };
      };
    };
    PrimaryRiotAccount: {
      select: {
        mmr: true;
        MMR: true;
      };
    };
    PlayerStats: true;
  };
}>;

export async function fetchPlayersPage({
  tier,
  leagueStatus,
  user,
  page = 1,
  searchType,
}: {
  tier: Tier;
  leagueStatus?: LeagueStatus | undefined;
  user?: string | undefined;
  page?: number;
  searchType: SearchType;
}) {
  const whereClause: Prisma.UserWhereInput = {
    Team: {
      tier,
    },
    ...(leagueStatus && {
      Status: {
        leagueStatus,
      },
    }),
    ...(user &&
      searchType === SearchType.DISCORD_ID && {
        Accounts: {
          some: {
            provider: "discord",
            providerAccountId: user,
          },
        },
      }),
    ...(user &&
      searchType === SearchType.RIOT_IGN && {
        PrimaryRiotAccount: {
          is: {
            riotIGN: user,
          },
        },
      }),
  };
  const totalUsers = await prisma.user.count({ where: whereClause });
  console.log(totalUsers)
  const users: TUserWithStats[] = await prisma.user.findMany({
    where: whereClause,
    select: {
      name: true,
      Team: {
        select: {
          Franchise: {
            select: {
              name: true,
              Brand: true,
            },
          },
        },
      },
      PrimaryRiotAccount: {
        select: {
          mmr: true,
          MMR: true,
        },
      },
      PlayerStats: true,
    },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  return {
    users,
    totalPages,
  };
}

export function generatePagination(
  current: number,
  total: number
): (number | "...")[] {
  const delta = 2;
  const range: number[] = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  const hasLeftEllipsis = current - delta > 2;
  const hasRightEllipsis = current + delta < total - 1;

  const pages: (number | "...")[] = [1];
  if (hasLeftEllipsis) pages.push("...");
  pages.push(...range);
  if (hasRightEllipsis) pages.push("...");
  if (total > 1) pages.push(total);
  return pages;
}
