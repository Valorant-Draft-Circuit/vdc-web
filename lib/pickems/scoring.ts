import { outcomeOf, type ResolvedMatch } from "./resolve";
import type { Score, SeededTeam } from "./picks";

const CORRECT_WINNER_POINTS = 1;
const EXACT_SCORE_BONUS = 2;
const MADE_CUTOFF_POINTS = 2;
const EXACT_SEED_BONUS = 1;

export function scoreMatchPick(pick: Score, result: ResolvedMatch): number {
  if (!result.resolved) {
    return 0;
  }

  let points = 0;
  const predictedOutcome = outcomeOf(pick.home, pick.away);
  const actualOutcome = outcomeOf(result.homeScore, result.awayScore);
  if (predictedOutcome === actualOutcome) {
    points += CORRECT_WINNER_POINTS;
  }

  const exactScore =
    pick.home === result.homeScore && pick.away === result.awayScore;
  if (exactScore) {
    points += EXACT_SCORE_BONUS;
  }
  return points;
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
