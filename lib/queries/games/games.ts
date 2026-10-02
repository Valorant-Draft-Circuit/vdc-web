import { prisma } from "@/lib/prisma";
import { GameType, MatchType, Prisma, Tier } from "@prisma/client";

export type Game = Prisma.GamesGetPayload<{
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
        matchDay: true;
      };
    };
  };
}>;

export type PlayerStats = Prisma.PlayerStatsGetPayload<{
   where: {
    userID;
    Game: {
      winner: { not: null };
      season: string;
      Match: {
        matchType: MatchType;
      }
    };
  };
  select: {
    Game: {
      select: {
        tier: true;
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
): Promise<Game[]> {
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
          matchDay: true,
        },
      },
    },
  });
}

/**
 * Fetch all Games played by the specified user in the season
 * @param userID
 * @param seasonNumber
 * @returns all Games by the specified user in the season
 */
export async function getAllGamesByUser(
  userID: string,
  seasonNumber: number
): Promise<PlayerStats[]> {
  return prisma.playerStats.findMany({
    where: {
      userID: userID,
      Game: {
        season: seasonNumber,
        winner: { not: null },
        Match: {
          matchType: MatchType.BO2,
        }
      },
    },
    select: {
      Game: {
        select: {
          tier: true,
        },
      },
    },
  });
}

export function determineWinner(){
  
}