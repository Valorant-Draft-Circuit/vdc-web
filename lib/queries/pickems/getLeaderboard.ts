import { cache } from "react";
import { LeagueStatus, MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TIERS_ASCENDING } from "@/lib/common/constants/tiers";
import { resolveMatch, type GameResult } from "@/lib/pickems/resolve";
import {
  isWinnerCorrect,
  scoreAdvancePick,
  scoreMatchPick,
} from "@/lib/pickems/scoring";
import {
  randomAdvanceSet,
  randomScore,
  type SeededTeam,
} from "@/lib/pickems/picks";
import { getAdvanceResult } from "./getAdvanceResult";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import {
  deriveBracketPicks,
  realBracketResults,
  scoreBracketPicks,
  type BracketPick,
} from "@/lib/pickems/bracket";

type TierScoreRow = {
  userId: string;
  name: string;
  image: string | null;
  points: number;
  correct: number;
  resolved: number;
  hasResolvedPicks: boolean;
};

export type BestTier = { tier: Tier; points: number };

export type LeaderRow = TierScoreRow & {
  totalPoints: number;
  bestTier: BestTier;
  resolvedTiers: number;
};

export type LeaderboardScope =
  { kind: "global" } | { kind: "group"; groupId: number };


function winnerAccuracy(row: LeaderRow): number {
  if (row.resolved === 0) {
    return 0;
  }
  return row.correct / row.resolved;
}

export const getLeaderboard = cache(
  async (
    season: number,
    tier: Tier | null,
    scope: LeaderboardScope,
  ): Promise<LeaderRow[]> => {
    const tiersToScore = tier === null ? TIERS_ASCENDING : [tier];

    let memberIds: Set<string> | null = null;
    if (scope.kind === "group") {
      const members = await prisma.pickemGroupMember.findMany({
        where: { groupID: scope.groupId },
        select: { userID: true },
      });
      memberIds = new Set(members.map((member) => member.userID));
      if (memberIds.size === 0) {
        return [];
      }
    }

    const tierBoards: Map<string, TierScoreRow>[] = [];
    for (const tierToScore of tiersToScore) {
      tierBoards.push(await scoreTier(season, tierToScore, memberIds));
    }

    const rows = new Map<string, LeaderRow>();
    tierBoards.forEach((board, boardIndex) => {
      const boardTier = tiersToScore[boardIndex];
      for (const tierRow of board.values()) {
        const resolvedIncrement = tierRow.hasResolvedPicks ? 1 : 0;
        const existing = rows.get(tierRow.userId);
        if (existing === undefined) {
          rows.set(tierRow.userId, {
            ...tierRow,
            totalPoints: tierRow.points,
            bestTier: { tier: boardTier, points: tierRow.points },
            resolvedTiers: resolvedIncrement,
          });
          continue;
        }
        existing.resolvedTiers += resolvedIncrement;
        existing.totalPoints += tierRow.points;
        existing.correct += tierRow.correct;
        existing.resolved += tierRow.resolved;
        existing.hasResolvedPicks =
          existing.hasResolvedPicks || tierRow.hasResolvedPicks;
        if (tierRow.points > existing.bestTier.points) {
          existing.bestTier = { tier: boardTier, points: tierRow.points };
        }
      }
    });

    if (rows.size > 0) {
      const suspendedStatuses = await prisma.status.findMany({
        where: {
          userID: { in: [...rows.keys()] },
          leagueStatus: LeagueStatus.SUSPENDED,
        },
        select: { userID: true },
      });
      for (const { userID } of suspendedStatuses) {
        rows.delete(userID);
      }
    }

    const isOverall = tier === null;
    for (const row of rows.values()) {
      if (!isOverall) {
        row.points = row.totalPoints;
        continue;
      }
      row.points =
        row.resolvedTiers > 0 ? row.totalPoints / row.resolvedTiers : 0;
    }

    return [...rows.values()].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return winnerAccuracy(b) - winnerAccuracy(a);
    });
  },
);

async function scoreTier(
  season: number,
  tier: Tier,
  memberIds: Set<string> | null,
): Promise<Map<string, TierScoreRow>> {
  const isExcluded = (userId: string) =>
    memberIds !== null && !memberIds.has(userId);

  const rows = new Map<string, TierScoreRow>();
  const ensureRow = (
    userId: string,
    name: string | null,
    image: string | null,
  ) => {
    const existing = rows.get(userId);
    if (existing) {
      return existing;
    }
    const created: TierScoreRow = {
      userId,
      name: name ?? "Player",
      image: image ?? null,
      points: 0,
      correct: 0,
      resolved: 0,
      hasResolvedPicks: false,
    };
    rows.set(userId, created);
    return created;
  };

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
        select: {
          userID: true,
          predictedHomeScore: true,
          predictedAwayScore: true,
          Player: { select: { name: true, image: true } },
        },
      },
    },
  });

  const matchById = new Map<number, (typeof matches)[number]>();
  const matchIdsByDay = new Map<number, number[]>();
  const slatesPlayedByUser = new Map<string, Set<number>>();
  const realPickKey = (userId: string, matchId: number) =>
    `${userId}:${matchId}`;
  const realPickByKey = new Map<string, { home: number; away: number }>();
  const nameByUser = new Map<string, string | null>();
  const imageByUser = new Map<string, string | null>();

  for (const match of matches) {
    matchById.set(match.matchID, match);
    const matchDay = match.matchDay as number;
    if (!matchIdsByDay.has(matchDay)) {
      matchIdsByDay.set(matchDay, []);
    }
    matchIdsByDay.get(matchDay)!.push(match.matchID);

    for (const pick of match.PickemMatchPicks) {
      if (isExcluded(pick.userID)) {
        continue;
      }
      if (!slatesPlayedByUser.has(pick.userID)) {
        slatesPlayedByUser.set(pick.userID, new Set());
      }
      slatesPlayedByUser.get(pick.userID)!.add(matchDay);
      realPickByKey.set(realPickKey(pick.userID, match.matchID), {
        home: pick.predictedHomeScore,
        away: pick.predictedAwayScore,
      });
      nameByUser.set(pick.userID, pick.Player.name);
      imageByUser.set(pick.userID, pick.Player.image);
    }
  }

  for (const [userId, slateDays] of slatesPlayedByUser) {
    const row = ensureRow(
      userId,
      nameByUser.get(userId) ?? null,
      imageByUser.get(userId) ?? null,
    );
    for (const matchDay of slateDays) {
      for (const matchId of matchIdsByDay.get(matchDay) ?? []) {
        const match = matchById.get(matchId)!;
        const result = resolveMatch(
          match.matchType,
          match.home,
          match.away,
          match.Games as GameResult[],
        );
        if (!result.resolved) {
          continue;
        }
        const pick =
          realPickByKey.get(realPickKey(userId, matchId)) ??
          randomScore(userId, matchId, match.matchType);
        row.points += scoreMatchPick(pick, result);
        row.resolved += 1;
        row.hasResolvedPicks = true;
        if (isWinnerCorrect(pick, result)) {
          row.correct += 1;
        }
      }
    }
  }

  const advancePicks = await prisma.pickemAdvancePick.findMany({
    where: { season, tier },
    select: {
      userID: true,
      predictedTeam: true,
      predictedSeed: true,
      Player: { select: { name: true, image: true } },
    },
  });
  const advanceByUser = new Map<string, SeededTeam[]>();
  for (const pick of advancePicks) {
    if (isExcluded(pick.userID)) {
      continue;
    }
    if (!advanceByUser.has(pick.userID)) {
      advanceByUser.set(pick.userID, []);
    }
    advanceByUser
      .get(pick.userID)!
      .push({ teamId: pick.predictedTeam, seed: pick.predictedSeed });
    nameByUser.set(pick.userID, pick.Player.name);
    imageByUser.set(pick.userID, pick.Player.image);
  }

  // Anyone who submitted an advancement pick shows on the board too, even before
  // it resolves at playoffs (0 points until then).
  for (const userId of advanceByUser.keys()) {
    ensureRow(
      userId,
      nameByUser.get(userId) ?? null,
      imageByUser.get(userId) ?? null,
    );
  }

  const advanceActual = await getAdvanceResult(tier, season);
  if (advanceActual.length > 0) {
    const teamIdsInSeason = (await getTeamsInSeason(tier, season)).map(
      (team) => team.id,
    );
    const advanceScoredUsers = new Set<string>([
      ...slatesPlayedByUser.keys(),
      ...advanceByUser.keys(),
    ]);
    for (const userId of advanceScoredUsers) {
      const row = ensureRow(
        userId,
        nameByUser.get(userId) ?? null,
        imageByUser.get(userId) ?? null,
      );
      const predicted =
        advanceByUser.get(userId) ??
        randomAdvanceSet(
          userId,
          season,
          tier,
          teamIdsInSeason,
          advanceActual.length,
        );
      row.points += scoreAdvancePick(predicted, advanceActual);
      row.hasResolvedPicks = true;
    }
  }

  const bracketPicks = await prisma.pickemBracketPick.findMany({
    where: { season, tier },
    select: {
      userID: true,
      round: true,
      slot: true,
      predictedTeam: true,
      predictedLoserGames: true,
      Player: { select: { name: true, image: true } },
    },
  });
  if (bracketPicks.length === 0) {
    return rows;
  }

  const bracketPicksByUser = new Map<string, BracketPick[]>();
  for (const pick of bracketPicks) {
    if (isExcluded(pick.userID)) {
      continue;
    }
    if (!bracketPicksByUser.has(pick.userID)) {
      bracketPicksByUser.set(pick.userID, []);
    }
    bracketPicksByUser.get(pick.userID)!.push({
      round: pick.round,
      slot: pick.slot,
      teamId: pick.predictedTeam,
      loserGames: pick.predictedLoserGames,
    });
    nameByUser.set(pick.userID, pick.Player.name);
    imageByUser.set(pick.userID, pick.Player.image);
  }

  const bracket = await getPlayoffBracket(tier, season);
  const bracketResults = realBracketResults(bracket);
  for (const [userId, userPicks] of bracketPicksByUser) {
    const row = ensureRow(
      userId,
      nameByUser.get(userId) ?? null,
      imageByUser.get(userId) ?? null,
    );
    const derived = deriveBracketPicks(bracket, userPicks);
    const score = scoreBracketPicks(derived, bracketResults);
    row.points += score.points;
    row.correct += score.correct;
    row.resolved += score.resolved;
    if (score.resolved > 0) {
      row.hasResolvedPicks = true;
    }
  }

  return rows;
}
