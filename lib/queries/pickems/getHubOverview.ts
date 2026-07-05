import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveMatch, type GameResult } from "@/lib/pickems/resolve";
import { scoreAdvancePick, scoreMatchPick } from "@/lib/pickems/scoring";
import { randomAdvanceSet, randomScore } from "@/lib/pickems/picks";
import { lockCountdown } from "@/lib/pickems/format";
import {
  maxBracketPoints,
  realBracketResults,
  scoreBracketPicks,
} from "@/lib/pickems/bracket";
import { getSlates } from "./getSlate";
import { getAdvanceBoard, getAdvanceLock } from "./getAdvanceBoard";
import { getAdvanceResult } from "./getAdvanceResult";
import { getBracketBoard, getUserBracketPicks } from "./getBracketBoard";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";

export type StageState = "open" | "locked" | "dead";

export type StageSummary = {
  state: StageState;
  statusLabel: string;
  points: number | null;
  maxPoints: number;
};

export type HubOverview = {
  matches: StageSummary;
  advancement: StageSummary;
  bracket: StageSummary;
};

async function summarizeMatchesStage(
  tier: Tier,
  season: number,
  userId: string | null,
  now: Date,
): Promise<StageSummary> {
  const slates = await getSlates(tier, season);
  if (slates.length === 0) {
    return {
      state: "dead",
      statusLabel: "No matches scheduled",
      points: null,
      maxPoints: 0,
    };
  }

  const nextOpenSlate = slates.find((slate) => slate.lockTime > now);
  const state: StageState = nextOpenSlate ? "open" : "locked";
  const statusLabel = nextOpenSlate
    ? lockCountdown(nextOpenSlate.lockTime, now)
    : "Locked";

  const matches = await prisma.matches.findMany({
    where: {
      season,
      tier,
      matchType: { in: [MatchType.BO2, MatchType.PRE_SEASON] },
      matchDay: { not: null },
    },
    select: {
      matchID: true,
      matchType: true,
      matchDay: true,
      home: true,
      away: true,
      Games: { select: { winner: true, gameType: true } },
      PickemMatchPicks: {
        where: { userID: userId ?? "" },
        select: { predictedHomeScore: true, predictedAwayScore: true },
      },
    },
  });

  let resolvedCount = 0;
  const playedDays = new Set<number>();
  for (const match of matches) {
    const result = resolveMatch(
      match.matchType,
      match.home,
      match.away,
      match.Games as GameResult[],
    );
    if (result.resolved) {
      resolvedCount++;
    }
    if (match.PickemMatchPicks.length > 0) {
      playedDays.add(match.matchDay as number);
    }
  }

  let points: number | null = null;
  if (userId && playedDays.size > 0) {
    points = 0;
    for (const match of matches) {
      if (!playedDays.has(match.matchDay as number)) {
        continue;
      }
      const result = resolveMatch(
        match.matchType,
        match.home,
        match.away,
        match.Games as GameResult[],
      );
      if (!result.resolved) {
        continue;
      }
      const storedPick = match.PickemMatchPicks[0];
      const pick = storedPick
        ? {
            home: storedPick.predictedHomeScore,
            away: storedPick.predictedAwayScore,
          }
        : randomScore(userId, match.matchID, match.matchType);
      points += scoreMatchPick(pick, result);
    }
  }

  return { state, statusLabel, points, maxPoints: resolvedCount * 3 };
}

async function summarizeAdvancementStage(
  tier: Tier,
  season: number,
  userId: string | null,
  hasMatchPicks: boolean,
  now: Date,
): Promise<StageSummary> {
  const [lock, board, result] = await Promise.all([
    getAdvanceLock(tier, season),
    getAdvanceBoard(tier, season),
    getAdvanceResult(tier, season),
  ]);
  const maxPoints = board.n * 3;

  if (lock === null) {
    return {
      state: "dead",
      statusLabel: "Window not open",
      points: null,
      maxPoints,
    };
  }

  const state: StageState = lock > now ? "open" : "locked";
  const statusLabel = state === "open" ? lockCountdown(lock, now) : "Locked";

  let points: number | null = null;
  if (userId && result.length > 0) {
    const storedPicks = await prisma.pickemAdvancePick.findMany({
      where: { userID: userId, season, tier },
      select: { predictedTeam: true, predictedSeed: true },
    });
    const predicted = storedPicks.map((pick) => ({
      teamId: pick.predictedTeam,
      seed: pick.predictedSeed,
    }));
    if (predicted.length > 0) {
      points = scoreAdvancePick(predicted, result);
    } else if (hasMatchPicks) {
      const teamIds = (await getTeamsInSeason(tier, season)).map(
        (team) => team.id,
      );
      points = scoreAdvancePick(
        randomAdvanceSet(userId, season, tier, teamIds, result.length),
        result,
      );
    }
  }

  return { state, statusLabel, points, maxPoints };
}

async function summarizeBracketStage(
  tier: Tier,
  season: number,
  userId: string | null,
  now: Date,
): Promise<StageSummary> {
  const { bracket, lock } = await getBracketBoard(tier, season);
  const maxPoints = maxBracketPoints(bracket);

  if (bracket.rounds.length === 0 || !bracket.seeded || !bracket.isInferable) {
    return {
      state: "dead",
      statusLabel: "Opens at playoffs",
      points: null,
      maxPoints,
    };
  }

  const isOpen = lock === null || lock > now;
  const statusLabel = isOpen
    ? lock === null
      ? "Open"
      : lockCountdown(lock, now)
    : "Locked";

  let points: number | null = null;
  if (userId) {
    const picks = await getUserBracketPicks(userId, season, tier);
    if (picks.length > 0) {
      points = scoreBracketPicks(picks, realBracketResults(bracket)).points;
    }
  }

  return { state: isOpen ? "open" : "locked", statusLabel, points, maxPoints };
}

export const getHubOverview = cache(
  async (
    tier: Tier,
    season: number,
    userId: string | null,
  ): Promise<HubOverview> => {
    const now = new Date();
    const matches = await summarizeMatchesStage(tier, season, userId, now);
    const [advancement, bracket] = await Promise.all([
      summarizeAdvancementStage(
        tier,
        season,
        userId,
        matches.points !== null,
        now,
      ),
      summarizeBracketStage(tier, season, userId, now),
    ]);
    return { matches, advancement, bracket };
  },
);
