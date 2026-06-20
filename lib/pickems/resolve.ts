import { GameType, MatchType } from "@prisma/client";

export type MatchOutcome = "HOME" | "AWAY" | "DRAW";

export type GameResult = { winner: number | null; gameType: GameType };

export type ResolvedMatch = {
  resolved: boolean;
  homeScore: number;
  awayScore: number;
  outcome: MatchOutcome | null;
};

export function maxGames(matchType: MatchType): number {
  if (matchType === MatchType.BO5) {
    return 5;
  }
  if (matchType === MatchType.BO3) {
    return 3;
  }
  return 2;
}

export function gamesToClinch(matchType: MatchType): number {
  return Math.floor(maxGames(matchType) / 2) + 1;
}

export function outcomeOf(homeScore: number, awayScore: number): MatchOutcome {
  if (homeScore > awayScore) {
    return "HOME";
  }
  if (awayScore > homeScore) {
    return "AWAY";
  }
  return "DRAW";
}

export function resolveMatch(
  matchType: MatchType,
  homeTeamId: number | null,
  awayTeamId: number | null,
  games: GameResult[],
): ResolvedMatch {
  let homeScore = 0;
  let awayScore = 0;
  let hasForfeit = false;

  for (const game of games) {
    if (game.gameType === GameType.INVALID) {
      continue;
    }
    if (game.gameType === GameType.FORFEIT) {
      hasForfeit = true;
    }
    const winnerIsHome = game.winner !== null && game.winner === homeTeamId;
    const winnerIsAway = game.winner !== null && game.winner === awayTeamId;
    if (winnerIsHome) {
      homeScore += 1;
    } else if (winnerIsAway) {
      awayScore += 1;
    }
  }

  const clinch = gamesToClinch(matchType);
  const gamesPlayed = homeScore + awayScore;
  const resolved =
    hasForfeit ||
    homeScore >= clinch ||
    awayScore >= clinch ||
    gamesPlayed >= maxGames(matchType);

  return {
    resolved,
    homeScore,
    awayScore,
    outcome: resolved ? outcomeOf(homeScore, awayScore) : null,
  };
}
