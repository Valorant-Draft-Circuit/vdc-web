import { cache } from "react";
import { Tier } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type StoredMatchPick = {
  matchId: number;
  homeScore: number;
  awayScore: number;
};
export type StoredAdvancePick = { teamId: number; seed: number };

export const getMyPicks = cache(
  async (userId: string, season: number, tier: Tier) => {
    const [matchPicks, advancePicks] = await Promise.all([
      prisma.pickemMatchPick.findMany({
        where: { userID: userId, Match: { season, tier } },
        select: {
          matchID: true,
          predictedHomeScore: true,
          predictedAwayScore: true,
        },
      }),
      prisma.pickemAdvancePick.findMany({
        where: { userID: userId, season, tier },
        select: { predictedTeam: true, predictedSeed: true },
        orderBy: { predictedSeed: "asc" },
      }),
    ]);
    return {
      match: matchPicks.map(
        (p): StoredMatchPick => ({
          matchId: p.matchID,
          homeScore: p.predictedHomeScore,
          awayScore: p.predictedAwayScore,
        }),
      ),
      advance: advancePicks.map(
        (p): StoredAdvancePick => ({
          teamId: p.predictedTeam,
          seed: p.predictedSeed,
        }),
      ),
    };
  },
);
