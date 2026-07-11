import { outcomeOf, type ResolvedMatch } from "./resolve";
import type { Score, SeededTeam } from "./picks";

export const CORRECT_WINNER_POINTS = 0.2;
const MADE_CUTOFF_POINTS = 2;
const EXACT_SEED_BONUS = 1;

export function scoreMatchPick(pick: Score, result: ResolvedMatch): number {
  return isWinnerCorrect(pick, result) ? CORRECT_WINNER_POINTS : 0;
}

export function scoreAdvancePick(
  predicted: SeededTeam[],
  actualSeededTeamIds: number[],
): number {
  const actualSeedByTeam = new Map<number, number>();
  actualSeededTeamIds.forEach((teamId, index) => {
    actualSeedByTeam.set(teamId, index + 1);
  });

  let points = 0;
  for (const { teamId, seed } of predicted) {
    const actualSeed = actualSeedByTeam.get(teamId);
    if (actualSeed === undefined) {
      continue;
    }
    points += MADE_CUTOFF_POINTS;
    if (actualSeed === seed) {
      points += EXACT_SEED_BONUS;
    }
  }
  return points;
}

export function isWinnerCorrect(pick: Score, result: ResolvedMatch): boolean {
  if (!result.resolved) {
    return false;
  }
  return (
    outcomeOf(pick.home, pick.away) ===
    outcomeOf(result.homeScore, result.awayScore)
  );
}
