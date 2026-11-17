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

type ScheduleSection = keyof Schedule;
type UpcomingMatch = Awaited<ReturnType<typeof getUpcomingMatches>>[number];

const SECTION_BY_TYPE: Partial<Record<MatchType, ScheduleSection>> = {
  [MatchType.PRE_SEASON]: "preSeason",
  [MatchType.BO2]: "regularSeason",
  [MatchType.BO3]: "bo3Season",
  [MatchType.BO5]: "bo5Season",
};

/** The start time most of a block's matches share; ties go to the earliest. */
function mainSlot(dates: Date[]): Date {
  const counts = new Map<number, number>();
  for (const date of dates) {
    counts.set(date.getTime(), (counts.get(date.getTime()) ?? 0) + 1);
  }
  let best = Infinity;
  let bestCount = 0;
  for (const [time, count] of counts) {
    if (count > bestCount || (count === bestCount && time < best)) {
      best = time;
      bestCount = count;
    }
  }
  return new Date(best);
}

function countWins(match: UpcomingMatch) {
  let homeWins = 0;
  let awayWins = 0;
  for (const game of match.Games ?? []) {
    if (game.winner === match.Home?.id) {
      homeWins++;
    } else {
      awayWins++;
    }
  }
  return { homeWins, awayWins };
}

export async function getScheduleByTier(
  tier: Tier,
  season: number,
): Promise<Schedule> {
  const upcomingMatches = await getUpcomingMatches({ tier, season });

  // Playoff round N is the Nth BO3 match day.
  const bo3MatchDays = [
    ...new Set(
      upcomingMatches
        .filter((match) => match.matchType === MatchType.BO3)
        .map((match) => match.matchDay),
    ),
  ].sort((a, b) => (a ?? 0) - (b ?? 0));

  // One block per match day, so a match moved to another time or date stays
  // with its day. Pre-season has no match days and groups by start time.
  const groups = new Map<
    string,
    { section: ScheduleSection; label: string; matches: UpcomingMatch[] }
  >();
  for (const match of upcomingMatches) {
    const section = SECTION_BY_TYPE[match.matchType];
    if (!section) continue;
    const isPreseason = section === "preSeason";
    const groupId = isPreseason
      ? `${section}:${match.dateScheduled.toISOString()}`
      : `${section}:${match.matchDay}`;
    let group = groups.get(groupId);
    if (!group) {
      group = {
        section,
        label: isPreseason ? "Preseason" : `MD${match.matchDay}`,
        matches: [],
      };
      groups.set(groupId, group);
    }
    group.matches.push(match);
  }

  const blocks = [...groups.values()]
    .map((group) => ({
      ...group,
      slot: mainSlot(group.matches.map((match) => match.dateScheduled)),
    }))
    .sort((a, b) => a.slot.getTime() - b.slot.getTime());

  const schedule: Schedule = {
    preSeason: {},
    regularSeason: {},
    bo3Season: {},
    bo5Season: {},
  };
  for (const { section, label, matches, slot } of blocks) {
    // Keyed "<label>|<ISO slot time>": the card renders the slot in the
    // viewer's timezone and the panel parses it to find the nearest day.
    schedule[section][`${label}|${slot.toISOString()}`] = matches.map(
      (match) => {
        const { homeWins, awayWins } = countWins(match);
        if (section === "preSeason") {
          return packageMatch(match, homeWins, awayWins);
        }
        const knockoutType = determineIfKnockout(match);
        const playoffRound =
          section === "bo3Season"
            ? bo3MatchDays.indexOf(match.matchDay) + 1
            : undefined;
        return packageMatch(
          match,
          homeWins,
          awayWins,
          knockoutType,
          playoffRound,
        );
      },
    );
  }
  return schedule;
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
