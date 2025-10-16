import { formatDate, packageMatch } from "@/lib/common/utils";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { MatchType, Tier } from "@prisma/client";
type TPackagedMatch = ReturnType<typeof packageMatch>;

export type TSchedule = {
  regularSeason: Record<string, TPackagedMatch[]>;
  preSeason: Record<string, TPackagedMatch[]>;
};

export async function getEveryUpcomingMatch() {
  const upcomingMatches = await getUpcomingMatchesDates();
  return upcomingMatches;
}

export async function getScheduleByTier(tier: Tier, season: number) {
  const regularSeasonDatesToMatches = {};
  const preseasonDatesToMatches = {};
  const upcomingMatches = await getUpcomingMatchesDates({
    tier: tier,
    season: season,
  });

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
      formattedDate = `${formattedDate} - Preseason|${match.dateScheduled}`;
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
      formattedDate = `${formattedDate} - MD ${match.matchDay}|${match.dateScheduled}`;
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

interface GetUpcomingMatchesOptions {
  tier?: Tier;
  season?: number;
  filter?: boolean;
}

async function getUpcomingMatchesDates(
  options: GetUpcomingMatchesOptions = {}
) {
  const currentSeason = await ControlPanel.getSeason();
  const { tier, season, filter } = options;

  const whereClause: any = {
    tier,
    season: !season ? currentSeason : season,
    matchType: MatchType.BO2,
    Home: { active: true },
    Away: { active: true },
  };

  if (filter) {
    whereClause.dateScheduled = {
      gte: new Date(),
    };
  }

  const upcomingMatches = await prisma.matches.findMany({
    where: whereClause,
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

  return upcomingMatches;
}
