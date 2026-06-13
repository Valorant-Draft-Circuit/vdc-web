import { getMmmrTierLinesCached } from "@/lib/common/cache";
import { MIN_GAMES_BY_MATCH_TYPE, TIERS_LIST } from "@/lib/common/constants";
import {
  SeasonBoundary,
  SignupTrend,
  bucketByMonth,
  bucketBySeason,
  bucketByWeek,
} from "@/lib/common/signups";
import { prisma } from "@/lib/prisma";
import { LeagueStatus, MatchType, Tier } from "@prisma/client";
import { addDays, format, subDays } from "date-fns";

export type SignedTierCount = {
  tier: Tier;
  count: number;
};

export type FreeAgentTierCount = {
  tier: Tier;
  faCount: number;
  rfaCount: number;
};

export type AdminSummary = {
  signedPlayerCount: number;
  signedPlayerCountByTier: SignedTierCount[];
  freeAgentCount: number;
  freeAgentCountByTier: FreeAgentTierCount[];
};

export async function getAdminSummary(): Promise<AdminSummary> {
  const [
    signedPlayerCount,
    freeAgentCount,
    signedPlayerCountByTier,
    freeAgentCountByTier,
  ] = await Promise.all([
    getSignedPlayerCount(),
    getTotalFreeAgentCount(),
    Promise.all(
      TIERS_LIST.map(async (tier) => ({
        tier,
        count: await getSignedPlayerCountByTier(tier),
      })),
    ),
    Promise.all(
      TIERS_LIST.map(async (tier) => ({
        tier,
        faCount: await getFreeAgentCountByTier(LeagueStatus.FREE_AGENT, tier),
        rfaCount: await getFreeAgentCountByTier(
          LeagueStatus.RESTRICTED_FREE_AGENT,
          tier,
        ),
      })),
    ),
  ]);

  return {
    signedPlayerCount,
    signedPlayerCountByTier,
    freeAgentCount,
    freeAgentCountByTier,
  };
}

export async function getNewPlayerCount() {
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: subDays(new Date(), 30),
      },
    },
    select: {
      createdAt: true,
    },
  });

  const grouped = users.reduce((acc, user) => {
    const date = user.createdAt.toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  return grouped;
}

export async function getSignedPlayerCount() {
  const playerCount = await prisma.user.count({
    where: {
      Status: { contractStatus: LeagueStatus.SIGNED },
    },
  });
  return playerCount;
}

export async function getSignedPlayerCountByTier(tier: Tier) {
  return await prisma.user.count({
    where: {
      Status: { contractStatus: LeagueStatus.SIGNED },
      Team: {
        tier: tier,
      },
    },
  });
}

export async function getFreeAgentCountByTier(
  faType: LeagueStatus,
  tier: Tier,
) {
  const { RECRUIT, PROSPECT, APPRENTICE, EXPERT } =
    await getMmmrTierLinesCached();

  let mmrRange;
  switch (tier) {
    case Tier.RECRUIT:
      mmrRange = { lte: RECRUIT.max };
      break;
    case Tier.PROSPECT:
      mmrRange = {
        gt: RECRUIT.max,
        lte: PROSPECT.max,
      };
      break;
    case Tier.APPRENTICE:
      mmrRange = {
        gt: PROSPECT.max,
        lte: APPRENTICE.max,
      };
      break;
    case Tier.EXPERT:
      mmrRange = {
        gt: APPRENTICE.max,
        lte: EXPERT.max,
      };
      break;
    case Tier.MYTHIC:
      mmrRange = { gt: EXPERT.max };
      break;
    default:
      throw new Error(`Invalid tier: ${tier}`);
  }

  const count = await prisma.user.count({
    where: {
      Status: {
        leagueStatus: faType,
      },
      PrimaryRiotAccount: {
        MMR: {
          mmrEffective: mmrRange,
        },
      },
    },
  });

  return count;
}

export async function getRestrictedFreeAgentCount() {
  return await prisma.user.count({
    where: {
      Status: { leagueStatus: LeagueStatus.RESTRICTED_FREE_AGENT },
    },
  });
}

export async function getTotalFreeAgentCount() {
  return await prisma.user.count({
    where: {
      OR: [
        { Status: { leagueStatus: LeagueStatus.RESTRICTED_FREE_AGENT } },
        { Status: { leagueStatus: LeagueStatus.FREE_AGENT } },
      ],
    },
  });
}

export async function getTotalPlayerCountOver(days) {
  const today = new Date();
  const startDate = subDays(today, days);

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        lte: today,
      },
    },
    select: { createdAt: true },
  });

  const dateList: string[] = [];
  for (let i = 0; i <= days; i++) {
    dateList.push(format(addDays(startDate, i), "yyyy-MM-dd"));
  }

  const counts: { date: string; total: number }[] = [];

  for (const date of dateList) {
    const count = users.filter((u) => u.createdAt <= new Date(date)).length;
    counts.push({ date, total: count });
  }
}

export type TierComposition = {
  tier: Tier;
  signed: number;
  fa: number;
  rfa: number;
  teams: number;
  faPerTeam: number | null;
};

export async function getActiveTeamCountByTier(tier: Tier): Promise<number> {
  return prisma.teams.count({ where: { tier, active: true } });
}

export async function getRosterComposition(): Promise<TierComposition[]> {
  return Promise.all(
    TIERS_LIST.map(async (tier) => {
      const [signed, fa, rfa, teams] = await Promise.all([
        getSignedPlayerCountByTier(tier),
        getFreeAgentCountByTier(LeagueStatus.FREE_AGENT, tier),
        getFreeAgentCountByTier(LeagueStatus.RESTRICTED_FREE_AGENT, tier),
        getActiveTeamCountByTier(tier),
      ]);

      const faPerTeam = teams === 0 ? null : fa / teams;
      return { tier, signed, fa, rfa, teams, faPerTeam };
    }),
  );
}

const SIGNUP_FUNNEL_STATUSES: LeagueStatus[] = [
  LeagueStatus.PENDING,
  LeagueStatus.MANUAL_REVIEW,
  LeagueStatus.APPROVED,
  LeagueStatus.DRAFT_ELIGIBLE,
];

const MANUAL_REVIEW_LIST_CAP = 8;

export type SignupFunnelEntry = { status: LeagueStatus; count: number };

export type SignupQueuePlayer = {
  id: string;
  name: string | null;
  image: string | null;
  discordId: string | null;
};

export type SignupQueue = {
  funnel: SignupFunnelEntry[];
  manualReviewCount: number;
  manualReviewPlayers: SignupQueuePlayer[];
};

export async function getSignupQueue(): Promise<SignupQueue> {
  const funnel = await Promise.all(
    SIGNUP_FUNNEL_STATUSES.map(async (status) => ({
      status,
      count: await prisma.status.count({ where: { leagueStatus: status } }),
    })),
  );

  const manualReviewCount =
    funnel.find((entry) => entry.status === LeagueStatus.MANUAL_REVIEW)?.count ?? 0;

  const reviewUsers = await prisma.user.findMany({
    where: { Status: { leagueStatus: LeagueStatus.MANUAL_REVIEW } },
    select: {
      id: true,
      name: true,
      image: true,
      Accounts: {
        where: { provider: "discord" },
        select: { providerAccountId: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
    take: MANUAL_REVIEW_LIST_CAP,
  });

  const manualReviewPlayers: SignupQueuePlayer[] = reviewUsers.map((user) => ({
    id: user.id,
    name: user.name,
    image: user.image,
    discordId: user.Accounts[0]?.providerAccountId ?? null,
  }));

  return { funnel, manualReviewCount, manualReviewPlayers };
}

const UNREPORTED_LIST_CAP = 8;

export type UnreportedMatch = {
  matchID: number;
  tier: Tier;
  matchDay: number | null;
  homeName: string;
  awayName: string;
  homeSlug: string | null;
  awaySlug: string | null;
  reported: number;
  expected: number;
};

export type UnreportedMatches = {
  count: number;
  matches: UnreportedMatch[];
};

export async function getUnreportedMatches(season: number): Promise<UnreportedMatches> {
  const rows = await prisma.matches.findMany({
    where: {
      season,
      dateScheduled: { lt: new Date() },
      matchType: { in: [MatchType.BO2, MatchType.BO3, MatchType.BO5] },
      home: { not: null },
      away: { not: null },
    },
    select: {
      matchID: true,
      tier: true,
      matchDay: true,
      matchType: true,
      Home: { select: { name: true, Franchise: { select: { slug: true } } } },
      Away: { select: { name: true, Franchise: { select: { slug: true } } } },
      _count: { select: { Games: true } },
    },
    orderBy: { dateScheduled: "asc" },
  });

  const unreported = rows
    .map((row) => ({
      matchID: row.matchID,
      tier: row.tier,
      matchDay: row.matchDay,
      homeName: row.Home?.name ?? "TBD",
      awayName: row.Away?.name ?? "TBD",
      homeSlug: row.Home?.Franchise.slug ?? null,
      awaySlug: row.Away?.Franchise.slug ?? null,
      reported: row._count.Games,
      expected: MIN_GAMES_BY_MATCH_TYPE[row.matchType] ?? 0,
    }))
    .filter((match) => match.reported < match.expected);

  return { count: unreported.length, matches: unreported.slice(0, UNREPORTED_LIST_CAP) };
}

const UPCOMING_VETO_WINDOW_DAYS = 7;
const UPCOMING_MISSING_VETO_LIST_CAP = 8;

export type UpcomingMatchMissingVeto = {
  matchID: number;
  tier: Tier;
  matchDay: number | null;
  homeName: string;
  awayName: string;
  homeSlug: string | null;
  awaySlug: string | null;
  dateScheduled: Date;
};

export type UpcomingMissingVetos = {
  count: number;
  matches: UpcomingMatchMissingVeto[];
};

export async function getUpcomingMissingVetos(season: number): Promise<UpcomingMissingVetos> {
  const now = new Date();
  const windowEnd = addDays(now, UPCOMING_VETO_WINDOW_DAYS);

  const rows = await prisma.matches.findMany({
    where: {
      season,
      dateScheduled: { gte: now, lte: windowEnd },
      matchType: { in: [MatchType.BO2, MatchType.BO3, MatchType.BO5] },
      home: { not: null },
      away: { not: null },
      MapBans: { none: { map: { not: null } } },
    },
    select: {
      matchID: true,
      tier: true,
      matchDay: true,
      dateScheduled: true,
      Home: { select: { name: true, Franchise: { select: { slug: true } } } },
      Away: { select: { name: true, Franchise: { select: { slug: true } } } },
    },
    orderBy: { dateScheduled: "asc" },
  });

  const matches = rows.map((row) => ({
    matchID: row.matchID,
    tier: row.tier,
    matchDay: row.matchDay,
    homeName: row.Home?.name ?? "TBD",
    awayName: row.Away?.name ?? "TBD",
    homeSlug: row.Home?.Franchise.slug ?? null,
    awaySlug: row.Away?.Franchise.slug ?? null,
    dateScheduled: row.dateScheduled,
  }));

  return { count: matches.length, matches: matches.slice(0, UPCOMING_MISSING_VETO_LIST_CAP) };
}

const SIGNUP_TREND_WEEKS = 12;
const SIGNUP_TREND_MONTHS = 12;

async function getSeasonBoundaries(): Promise<SeasonBoundary[]> {
  const grouped = await prisma.matches.groupBy({
    by: ["season"],
    _min: { dateScheduled: true },
  });

  return grouped
    .filter((group) => group._min.dateScheduled !== null)
    .map((group) => ({ season: group.season, firstMatch: group._min.dateScheduled as Date }));
}

export async function getSignupTrend(): Promise<SignupTrend> {
  const [users, boundaries] = await Promise.all([
    prisma.user.findMany({ select: { createdAt: true } }),
    getSeasonBoundaries(),
  ]);

  const dates = users.map((user) => user.createdAt);
  const now = new Date();

  return {
    weekly: bucketByWeek(dates, now, SIGNUP_TREND_WEEKS),
    monthly: bucketByMonth(dates, now, SIGNUP_TREND_MONTHS),
    bySeason: bucketBySeason(dates, boundaries),
  };
}

export type OpsInsights = {
  signupQueue: SignupQueue;
  unreportedMatches: UnreportedMatches;
  upcomingMissingVetos: UpcomingMissingVetos;
  signupTrend: SignupTrend;
};

export async function getOpsInsights(season: number): Promise<OpsInsights> {
  const [signupQueue, unreportedMatches, upcomingMissingVetos, signupTrend] = await Promise.all([
    getSignupQueue(),
    getUnreportedMatches(season),
    getUpcomingMissingVetos(season),
    getSignupTrend(),
  ]);

  return { signupQueue, unreportedMatches, upcomingMissingVetos, signupTrend };
}
