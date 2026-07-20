import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type LobbyStatRow = {
  gameID: string;
  userID: string;
  team: number | null;
  agent: string;
  acs: number | null;
  ratingAttack: number | null;
  ratingDefense: number | null;
  hsPercent: number | null;
  damage: number | null;
  Player: {
    PrimaryRiotAccount: { riotIGN: string | null } | null;
  };
};

export const getLobbyStatsForGames = cache(
  async (gameIDs: string[]): Promise<LobbyStatRow[]> => {
    if (gameIDs.length === 0) return [];

    return prisma.playerStats.findMany({
      where: { gameID: { in: gameIDs } },
      select: {
        gameID: true,
        userID: true,
        team: true,
        agent: true,
        acs: true,
        ratingAttack: true,
        ratingDefense: true,
        hsPercent: true,
        damage: true,
        Player: {
          select: {
            PrimaryRiotAccount: { select: { riotIGN: true } },
          },
        },
      },
    });
  },
);
