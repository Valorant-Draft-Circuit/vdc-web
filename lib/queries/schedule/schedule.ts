import {
  determineIfKnockout,
  formatDate,
  packageMatch,
} from "@/lib/common/utils";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { MatchType, Tier } from "@prisma/client";
type TPackagedMatch = ReturnType<typeof packageMatch>;

export type TSchedule = {
  regularSeason: Record<string, TPackagedMatch[]>;
  preSeason: Record<string, TPackagedMatch[]>;
};

export async function getEveryUpcomingMatch() {
  const upcomingMatches = await getUpcomingMatches({ filter: true });
  return upcomingMatches;
}

export async function getScheduleByTier(tier: Tier, season: number) {
  const preseasonDatesToMatches = {};
  const regularSeasonDatesToMatches = {};

  const upcomingMatches = await getUpcomingMatches({
    tier: tier,
    season: season,
  });

  upcomingMatches.map((match, i, upcomingMatches) => {
    let knockoutType;
    if (i !== 0) {
      knockoutType = determineIfKnockout(match, upcomingMatches, i);
    }
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
        formattedDate,
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
        formattedDate,
        knockoutType,
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

type TUpcomingWhereClause = {
  tier?: Tier;
  season: number;
  matchType: MatchType[];
  Home: { active: boolean };
  Away: { active: boolean };
  dateScheduled?: { gte: Date };
};

async function getUpcomingMatches(options: GetUpcomingMatchesOptions = {}) {
  const currentSeason = await ControlPanel.getSeason();
  const { tier, season, filter } = options;

  const whereClause: TUpcomingWhereClause = {
    tier,
    season: !season ? currentSeason : season,
    matchType: [
      MatchType.PRE_SEASON,
      MatchType.BO2,
      MatchType.BO3,
      MatchType.BO5,
    ],
    Home: { active: true },
    Away: { active: true },
  };

  let take: number | undefined;

  if (filter) {
    whereClause.dateScheduled = {
      gte: new Date(),
    };
    take = 12;
  }

  const upcomingMatches = await prisma.matches.findMany({
    where: {
      ...whereClause,
      matchType: { in: whereClause.matchType },
    },
    take: take,
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
    orderBy: [{ dateScheduled: "asc" }],
  });

  return upcomingMatches;
}
