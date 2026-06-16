import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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

export type LeaderRow = {
  userId: string;
  name: string;
  image: string | null;
  points: number;
  correct: number;
  resolved: number;
};

export type LeaderboardScope =
  | { kind: "global" }
  | { kind: "group"; groupId: number };

const ALL_TIERS: Tier[] = [
  Tier.RECRUIT,
  Tier.PROSPECT,
  Tier.APPRENTICE,
  Tier.EXPERT,
  Tier.MYTHIC,
];

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
    const tiersToScore = tier === null ? ALL_TIERS : [tier];

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

    const rows = new Map<string, LeaderRow>();
    const ensureRow = (
      userId: string,
      name: string | null,
      image: string | null,
    ) => {
      const existing = rows.get(userId);
      if (existing) {
        return existing;
      }
      const created: LeaderRow = {
        userId,
        name: name ?? "Player",
        image: image ?? null,
        points: 0,
        correct: 0,
        resolved: 0,
      };
      rows.set(userId, created);
      return created;
    };

    for (const tierToScore of tiersToScore) {
      await scoreTier(season, tierToScore, memberIds, ensureRow);
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
  ensureRow: (
    userId: string,
    name: string | null,
    image: string | null,
  ) => LeaderRow,
) {
  const isExcluded = (userId: string) =>
    memberIds !== null && !memberIds.has(userId);

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
          homeScore: true,
          awayScore: true,
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
        home: pick.homeScore,
        away: pick.awayScore,
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
        if (isWinnerCorrect(pick, result)) {
          row.correct += 1;
        }
      }
    }
  }

  const advanceActual = await getAdvanceResult(tier, season);
  if (advanceActual.length === 0) {
    return;
  }

  const advancePicks = await prisma.pickemAdvancePick.findMany({
    where: { season, tier },
    select: { userID: true, team: true, seed: true },
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
      .push({ teamId: pick.team, seed: pick.seed });
  }

  const teamIdsInSeason = (await getTeamsInSeason(tier, season)).map(
    (team) => team.id,
  );
  for (const userId of slatesPlayedByUser.keys()) {
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
  }
}
