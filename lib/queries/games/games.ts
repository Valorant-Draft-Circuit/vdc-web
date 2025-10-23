import { prisma } from "@/lib/prisma";
import { GameType, Prisma, Tier } from "@prisma/client";

export type TGame = Prisma.GamesGetPayload<{
  where: {
    tier;
    season: string;
    OR: [{ gameType: GameType }, { gameType: GameType }];
    winner: { not: null };
  };
  select: {
    winner: true;
    rounds: true;
    roundsWonHome: true;
    roundsWonAway: true;
    Match: {
      select: {
        home: true;
        away: true;
      };
    };
  };
}>;

/**
 * Fetch all Games by the specified tier and season
 * @param tier
 * @param seasonNumber
 * @returns all Games by the specified tier and season
 */
export async function getAllGamesBy(
  tier: Tier,
  seasonNumber: number
): Promise<TGame[]> {
  return prisma.games.findMany({
    where: {
      tier,
      season: seasonNumber,
      OR: [{ gameType: GameType.SEASON }, { gameType: GameType.FORFEIT }],
      winner: { not: null },
    },
    select: {
      winner: true,
      rounds: true,
      roundsWonHome: true,
      roundsWonAway: true,
      Match: {
        select: {
          home: true,
          away: true,
        },
      },
    },
  });
}


export function determineWinner(){
  
}