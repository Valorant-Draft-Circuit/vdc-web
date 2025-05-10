import { formatDate, packageMatch } from "@/lib/common/utils";
import { prisma } from "@/prisma/prismadb";
import { MatchType, Tier } from "@prisma/client";
type PackagedMatch = ReturnType<typeof packageMatch>;

export type Schedule = {
  regularSeason: Record<string, PackagedMatch[]>;
  preSeason: Record<string, PackagedMatch[]>;
};

export async function getScheduleByTier(tier: Tier, season: number) {
  const regularSeasonDatesToMatches = {};
  const preseasonDatesToMatches = {};
  const upcomingMatches = await getUpcomingMatchesDates(tier, season);

  upcomingMatches.map((match) => {
    let homeWins = 0;
    let awayWins = 0;
    if (match.Games) {
      match.Games.forEach((game) => {
        if (game.winner === match.Home?.id) {
          homeWins++;
        } else {
          awayWins++;
        }
      });
    }

    let formattedDate = formatDate(match.dateScheduled);
    if (match.matchType === MatchType.PRE_SEASON) {
      formattedDate = `${formattedDate} - Preseason`;
      if (!preseasonDatesToMatches[formattedDate]) {
        preseasonDatesToMatches[formattedDate] = [];
      }
      const packagedMatch = packageMatch(
        match,
        homeWins,
        awayWins,
        formattedDate
      );
      preseasonDatesToMatches[formattedDate].push(packagedMatch);
    } else {
      formattedDate = `${formattedDate} - MD`;
      if (!regularSeasonDatesToMatches[formattedDate]) {
        regularSeasonDatesToMatches[formattedDate] = [];
      }
      const packagedMatch = packageMatch(
        match,
        homeWins,
        awayWins,
        formattedDate
      );
      regularSeasonDatesToMatches[formattedDate].push(packagedMatch);
    }
  });
  const matches = {
    regularSeason: regularSeasonDatesToMatches,
    preSeason: preseasonDatesToMatches,
  };
  return matches;
}

async function getUpcomingMatchesDates(tier: Tier, season: number) {
  const upcomingMatches = await prisma.matches.findMany({
    where: {
      tier: tier,
      season: season,
      matchType: MatchType.BO2,
      Home: {
        active: true,
      },
      Away: {
        active: true,
      },
    },
    include: {
      Home: {
        include: {
          Franchise: {
            include: {
              Brand: true,
            },
          },
        },
      },
      Away: {
        include: {
          Franchise: {
            include: {
              Brand: true,
            },
          },
        },
      },
      Games: true,
    },
    orderBy: {
      dateScheduled: "asc",
    },
  });
  await prisma.$disconnect();
  upcomingMatches.sort((a, b) =>
    a.dateScheduled.toISOString().localeCompare(b.dateScheduled.toISOString())
  );

  return upcomingMatches;
}
