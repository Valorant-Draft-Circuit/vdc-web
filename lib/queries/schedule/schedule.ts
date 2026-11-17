import { determineIfKnockout, packageMatch } from "@/lib/common/match";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { MatchType, Prisma, Tier } from "@prisma/client";
type PackagedMatch = ReturnType<typeof packageMatch>;

const upcomingMatchTypes = [
  MatchType.PRE_SEASON,
  MatchType.BO2,
  MatchType.BO3,
  MatchType.BO5,
];

const upcomingMatchInclude = {
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
} satisfies Prisma.MatchesInclude;

export type Schedule = {
  preSeason: Record<string, PackagedMatch[]>;
  regularSeason: Record<string, PackagedMatch[]>;
  bo3Season: Record<string, PackagedMatch[]>;
  bo5Season: Record<string, PackagedMatch[]>;
};

export type UpcomingMatchRow = Awaited<
  ReturnType<typeof getUpcomingMatches>
>[number];

export async function getEveryUpcomingMatch() {
  const upcomingMatches = await getUpcomingMatches({ filter: true });
  return upcomingMatches;
}

export async function getUpcomingMatchesForTeam(teamId: number, limit = 3) {
  const currentSeason = await ControlPanel.getSeason();

  const upcomingMatches = await prisma.matches.findMany({
    where: {
      season: currentSeason,
      matchType: { in: upcomingMatchTypes },
      dateScheduled: { gte: new Date() },
      Home: { active: true },
      Away: { active: true },
      OR: [{ home: teamId }, { away: teamId }],
    },
    take: limit,
    include: upcomingMatchInclude,
    orderBy: [{ dateScheduled: "asc" }],
  });

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

    // Keyed "<label>|<ISO time>": the card renders the date in the viewer's
    // timezone and the panel parses the time to find the nearest day.
    const iso = match.dateScheduled.toISOString();
    if (match.matchType === MatchType.PRE_SEASON) {
      const dayKey = `Preseason|${iso}`;
      preseasonDatesToMatches[dayKey] ??= [];
      preseasonDatesToMatches[dayKey].push(
        packageMatch(match, homeWins, awayWins),
      );
    } else if (match.matchType === MatchType.BO2) {
      const dayKey = `MD${match.matchDay}|${iso}`;
      regularSeasonDatesToMatches[dayKey] ??= [];
      regularSeasonDatesToMatches[dayKey].push(
        packageMatch(match, homeWins, awayWins, knockoutType),
      );
    } else if (match.matchType === MatchType.BO3) {
      if (lastMatchDay !== match.matchDay) {
        playoffRound += 1;
        lastMatchDay = match.matchDay;
      }
      const dayKey = `MD${match.matchDay}|${iso}`;
      bo3DatesToMatches[dayKey] ??= [];
      bo3DatesToMatches[dayKey].push(
        packageMatch(match, homeWins, awayWins, knockoutType, playoffRound),
      );
    } else if (match.matchType === MatchType.BO5) {
      const dayKey = `MD${match.matchDay}|${iso}`;
      bo5DatesToMatches[dayKey] ??= [];
      bo5DatesToMatches[dayKey].push(
        packageMatch(match, homeWins, awayWins, knockoutType),
      );
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
    matchType: upcomingMatchTypes,
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
    include: upcomingMatchInclude,
    orderBy: [{ dateScheduled: "asc" }],
  });

  return upcomingMatches;
}
