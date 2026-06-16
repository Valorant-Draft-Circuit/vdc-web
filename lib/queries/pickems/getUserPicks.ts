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
        select: { matchID: true, homeScore: true, awayScore: true },
      }),
      prisma.pickemAdvancePick.findMany({
        where: { userID: userId, season, tier },
        select: { team: true, seed: true },
        orderBy: { seed: "asc" },
      }),
    ]);
    return {
      match: matchPicks.map(
        (p): StoredMatchPick => ({
          matchId: p.matchID,
          homeScore: p.homeScore,
          awayScore: p.awayScore,
        }),
      ),
      advance: advancePicks.map(
        (p): StoredAdvancePick => ({ teamId: p.team, seed: p.seed }),
      ),
    };
  },
);
