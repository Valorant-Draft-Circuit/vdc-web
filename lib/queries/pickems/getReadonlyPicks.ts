import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  resolveMatch,
  type GameResult,
  type ResolvedMatch,
} from "@/lib/pickems/resolve";
import { scoreMatchPick, scoreAdvancePick } from "@/lib/pickems/scoring";
import { randomScore, type Score } from "@/lib/pickems/picks";
import { getSlates } from "./getSlate";
import { getMyPicks } from "./getUserPicks";
import { getAdvanceResult } from "./getAdvanceResult";
import { getAdvanceBoard } from "./getAdvanceBoard";

type TeamRef = { name: string; slug: string; logo: string | null };

export type ReadonlyMatch = {
  matchId: number;
  matchType: MatchType;
  home: TeamRef | null;
  away: TeamRef | null;
  pick: Score | null;
  isRandom: boolean;
  result: ResolvedMatch;
  points: number;
  pickStatus: "right" | "wrong" | "pending";
};

export type ReadonlySlate = {
  matchDay: number;
  lockTime: Date;
  dateLabel: string;
  matches: ReadonlyMatch[];
  slatePoints: number;
  correct: number;
  total: number;
};

export type ReadonlyChip = {
  seed: number;
  teamId: number;
  name: string;
  logo: string | null;
  status: "exact" | "made" | "miss" | "pending";
};

export type ReadonlyAdvance = {
  resolved: boolean;
  points: number;
  chips: ReadonlyChip[];
};

export type ReadonlyPicks = {
  playerName: string;
  playerImage: string | null;
  slates: ReadonlySlate[];
  advance: ReadonlyAdvance | null;
};

const UNRESOLVED: ResolvedMatch = {
  resolved: false,
  homeScore: 0,
  awayScore: 0,
  outcome: null,
};

function toTeamRef(team: TeamRef | null): TeamRef | null {
  if (team === null) {
    return null;
  }
  return { name: team.name, slug: team.slug, logo: team.logo };
}

function pickStatusOf(
  result: ResolvedMatch,
  points: number,
): ReadonlyMatch["pickStatus"] {
  if (!result.resolved) {
    return "pending";
  }
  if (points > 0) {
    return "right";
  }
  return "wrong";
}

function advanceChipStatus(
  actualSeed: number | undefined,
  predictedSeed: number,
): ReadonlyChip["status"] {
  if (actualSeed === undefined) {
    return "miss";
  }
  if (actualSeed === predictedSeed) {
    return "exact";
  }
  return "made";
}

async function fetchResultsByMatch(tier: Tier, season: number) {
  const matches = await prisma.matches.findMany({
    where: {
      tier,
      season,
      matchType: { in: [MatchType.BO2, MatchType.PRE_SEASON] },
      matchDay: { not: null },
    },
    select: {
      matchID: true,
      matchType: true,
      home: true,
      away: true,
      Games: { select: { winner: true, gameType: true } },
    },
  });

  const resultByMatch = new Map<number, ResolvedMatch>();
  for (const match of matches) {
    resultByMatch.set(
      match.matchID,
      resolveMatch(
        match.matchType,
        match.home,
        match.away,
        match.Games as GameResult[],
      ),
    );
  }
  return resultByMatch;
}

function buildLockedSlate(
  slate: Awaited<ReturnType<typeof getSlates>>[number],
  userId: string,
  resultByMatch: Map<number, ResolvedMatch>,
  realPickByMatch: Map<number, Score>,
): ReadonlySlate {
  const participatedInSlate = slate.matches.some((match) =>
    realPickByMatch.has(match.matchId),
  );

  const matches: ReadonlyMatch[] = [];
  let slatePoints = 0;
  let correct = 0;

  for (const match of slate.matches) {
    const result = resultByMatch.get(match.matchId) ?? UNRESOLVED;

    if (!participatedInSlate) {
      matches.push({
        matchId: match.matchId,
        matchType: match.matchType,
        home: toTeamRef(match.home),
        away: toTeamRef(match.away),
        pick: null,
        isRandom: false,
        result,
        points: 0,
        pickStatus: "pending",
      });
      continue;
    }

    const realPick = realPickByMatch.get(match.matchId);
    const pick =
      realPick ?? randomScore(userId, match.matchId, match.matchType);
    const points = scoreMatchPick(pick, result);
    slatePoints += points;
    if (result.resolved && points > 0) {
      correct += 1;
    }
    matches.push({
      matchId: match.matchId,
      matchType: match.matchType,
      home: toTeamRef(match.home),
      away: toTeamRef(match.away),
      pick,
      isRandom: realPick === undefined,
      result,
      points,
      pickStatus: pickStatusOf(result, points),
    });
  }

  return {
    matchDay: slate.matchDay,
    lockTime: slate.lockTime,
    dateLabel: slate.dateLabel,
    matches,
    slatePoints,
    correct,
    total: matches.filter((match) => match.result.resolved).length,
  };
}

async function buildAdvance(
  tier: Tier,
  season: number,
  storedAdvance: Awaited<ReturnType<typeof getMyPicks>>["advance"],
): Promise<ReadonlyAdvance | null> {
  if (storedAdvance.length === 0) {
    return null;
  }

  const [actual, board] = await Promise.all([
    getAdvanceResult(tier, season),
    getAdvanceBoard(tier, season),
  ]);
  const resolved = actual.length > 0;

  const teamRefById = new Map<number, TeamRef>();
  for (const team of board.teams) {
    teamRefById.set(team.id, {
      name: team.name,
      slug: team.slug,
      logo: team.logo,
    });
  }

  const actualSeedByTeam = new Map<number, number>();
  actual.forEach((teamId, index) => {
    actualSeedByTeam.set(teamId, index + 1);
  });

  const predicted = [...storedAdvance].sort((a, b) => a.seed - b.seed);
  const chips: ReadonlyChip[] = predicted.map((entry) => {
    const ref = teamRefById.get(entry.teamId);
    const status = resolved
      ? advanceChipStatus(actualSeedByTeam.get(entry.teamId), entry.seed)
      : "pending";
    return {
      seed: entry.seed,
      teamId: entry.teamId,
      name: ref?.name ?? "Team",
      logo: ref?.logo ?? null,
      status,
    };
  });

  return {
    resolved,
    points: resolved ? scoreAdvancePick(predicted, actual) : 0,
    chips,
  };
}

export const getReadonlyPicks = cache(
  async (
    userId: string,
    tier: Tier,
    season: number,
  ): Promise<ReadonlyPicks> => {
    const now = new Date();
    const [player, slates, stored, resultByMatch] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true },
      }),
      getSlates(tier, season),
      getMyPicks(userId, season, tier),
      fetchResultsByMatch(tier, season),
    ]);

    const realPickByMatch = new Map<number, Score>();
    for (const storedPick of stored.match) {
      realPickByMatch.set(storedPick.matchId, {
        home: storedPick.homeScore,
        away: storedPick.awayScore,
      });
    }

    const lockedSlates: ReadonlySlate[] = [];
    for (const slate of slates) {
      if (slate.lockTime > now) {
        continue;
      }
      lockedSlates.push(
        buildLockedSlate(slate, userId, resultByMatch, realPickByMatch),
      );
    }

    const advance = await buildAdvance(tier, season, stored.advance);

    return {
      playerName: player?.name ?? "Player",
      playerImage: player?.image ?? null,
      slates: lockedSlates,
      advance,
    };
  },
);
