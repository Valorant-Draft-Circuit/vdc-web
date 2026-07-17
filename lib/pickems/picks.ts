import { MatchType, Tier } from "@prisma/client";
import { gamesToClinch, maxGames } from "./resolve";
import { pseudoRandomUnitInterval } from "@/lib/common/random";

export type Score = { home: number; away: number };
export type SeededTeam = { teamId: number; seed: number };

export function legalScores(matchType: MatchType): Score[] {
  if (maxGames(matchType) === 2) {
    return [
      { home: 2, away: 0 },
      { home: 1, away: 1 },
      { home: 0, away: 2 },
    ];
  }

  const clinch = gamesToClinch(matchType);
  const scores: Score[] = [];
  for (let loserGames = 0; loserGames < clinch; loserGames++) {
    scores.push({ home: clinch, away: loserGames });
  }
  for (let loserGames = clinch - 1; loserGames >= 0; loserGames--) {
    scores.push({ home: loserGames, away: clinch });
  }
  return scores;
}

export function isLegalScore(
  matchType: MatchType,
  home: number,
  away: number,
): boolean {
  return legalScores(matchType).some(
    (score) => score.home === home && score.away === away,
  );
}

export function randomScore(
  userId: string,
  matchId: number,
  matchType: MatchType,
): Score {
  const options = legalScores(matchType);
  const roll = pseudoRandomUnitInterval(`${userId}:${matchId}`);
  return options[Math.floor(roll * options.length)];
}

export function randomAdvanceSet(
  userId: string,
  season: number,
  tier: Tier,
  teamIds: number[],
  count: number,
): SeededTeam[] {
  const pool = [...teamIds];
  const seedPrefix = `${userId}:${season}:${tier}`;
  for (let current = pool.length - 1; current > 0; current--) {
    const roll = pseudoRandomUnitInterval(`${seedPrefix}:${current}`);
    const swapWith = Math.floor(roll * (current + 1));
    [pool[current], pool[swapWith]] = [pool[swapWith], pool[current]];
  }
  return pool.slice(0, count).map((teamId, index) => ({
    teamId,
    seed: index + 1,
  }));
}
