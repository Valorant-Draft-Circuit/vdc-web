import { determineIfKnockout, packageMatch } from "@/lib/common/match";
import { formatDate } from "@/lib/common/format";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { MatchType, Tier } from "@prisma/client";
type PackagedMatch = ReturnType<typeof packageMatch>;

export type Schedule = {
  preSeason: Record<string, PackagedMatch[]>;
  regularSeason: Record<string, PackagedMatch[]>;
  bo3Season: Record<string, PackagedMatch[]>;
  bo5Season: Record<string, PackagedMatch[]>;
};

export async function getEveryUpcomingMatch() {
  const upcomingMatches = await getUpcomingMatches({ filter: true });
  return upcomingMatches;
}

export async function getScheduleByTier(tier: Tier, season: number) {
  const preseasonDatesToMatches = {};
  const regularSeasonDatesToMatches = {};
  const bo3DatesToMatches = {};
  const bo5DatesToMatches = {};

  const upcomingMatches = await getUpcomingMatches({
    tier: tier,
    season: season,
  });
  let playoffRound = 0;
  let lastMatchDay;
  upcomingMatches.map((match) => {
    const knockoutType = determineIfKnockout(match);

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
    } else if (match.matchType === MatchType.BO2) {
      formattedDate = `${formattedDate} - MD${match.matchDay}|${match.dateScheduled}`;
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
    } else if (match.matchType === MatchType.BO3) {
      if (lastMatchDay !== match.matchDay) {
        playoffRound += 1;
        lastMatchDay = match.matchDay;
      }

      formattedDate = `${formattedDate} - MD${match.matchDay}|${match.dateScheduled}`;

      if (!bo3DatesToMatches[formattedDate]) {
        bo3DatesToMatches[formattedDate] = [];
      }

      const packagedMatch = packageMatch(
        match,
        homeWins,
        awayWins,
        formattedDate,
        knockoutType,
        playoffRound,
      );

      bo3DatesToMatches[formattedDate].push(packagedMatch);
    } else if (match.matchType === MatchType.BO5) {
      formattedDate = `${formattedDate} - MD${match.matchDay}|${match.dateScheduled}`;

      if (!bo5DatesToMatches[formattedDate]) {
        bo5DatesToMatches[formattedDate] = [];
      }

      const packagedMatch = packageMatch(
        match,
        homeWins,
        awayWins,
        formattedDate,
        knockoutType,
      );
      bo5DatesToMatches[formattedDate].push(packagedMatch);
    }
  });

  const matches = {
    preSeason: preseasonDatesToMatches,
    regularSeason: regularSeasonDatesToMatches,
    bo3Season: bo3DatesToMatches,
    bo5Season: bo5DatesToMatches,
  };
  return matches;
}

type GetUpcomingMatchesOptions = {
  tier?: Tier;
  season?: number;
  filter?: boolean;
};

type UpcomingWhereClause = {
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

  const whereClause: UpcomingWhereClause = {
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
