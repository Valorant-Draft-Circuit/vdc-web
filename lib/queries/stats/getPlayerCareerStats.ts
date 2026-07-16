import { cache } from "react";
import { GameType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RawStatRow } from "@/lib/common/indepth";

export const getPlayerCareerStats = cache(
  async (args: {
    riotIgn: string;
    gameType: GameType;
  }): Promise<RawStatRow[]> => {
    const account = await prisma.account.findFirst({
      where: { riotIGN: args.riotIgn },
      select: { userId: true },
    });
    if (!account) return [];

    return prisma.playerStats.findMany({
      where: {
        userID: account.userId,
        Game: { gameType: args.gameType },
      },
      select: {
        agent: true,
        team: true,
        ratingAttack: true,
        ratingDefense: true,
        acs: true,
        kast: true,
        hsPercent: true,
        kills: true,
        deaths: true,
        assists: true,
        firstKills: true,
        firstDeaths: true,
        plants: true,
        defuses: true,
        tradeKills: true,
        tradeDeaths: true,
        ecoKills: true,
        antiEcoKills: true,
        clutches: true,
        damage: true,
        Game: {
          select: {
            season: true,
            datePlayed: true,
            tier: true,
            winner: true,
            rounds: true,
          },
        },
      },
    });
  },
);
