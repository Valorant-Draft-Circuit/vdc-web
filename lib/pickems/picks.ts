import { MatchType, Tier } from "@prisma/client";
import { gamesToClinch, maxGames } from "./resolve";

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

function fnv1aHash(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function pseudoRandomUnitInterval(seed: string): number {
  let state = (fnv1aHash(seed) + 0x6d2b79f5) >>> 0;
  state = Math.imul(state ^ (state >>> 15), state | 1);
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
  return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
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
