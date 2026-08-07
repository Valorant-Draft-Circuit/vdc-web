import { MatchType } from "@prisma/client";
import type { Bracket } from "@/lib/common/bracket";

export type BracketPick = {
  round: number;
  slot: number;
  teamId: number;
  loserGames: number;
};

export type BracketRoundResult = {
  round: number;
  loserGamesByWinner: Map<number, number>;
  resolvedCount: number;
};

export type BracketScore = {
  points: number;
  correct: number;
  resolved: number;
};

export const BRACKET_WINNER_POINTS: Record<number, number> = {
  0: 20,
  1: 10,
  2: 5,
  3: 3,
};

export function maxLoserGames(matchType: MatchType): number {
  return matchType === MatchType.BO5 ? 2 : 1;
}

export function maxBracketPoints(bracket: Bracket): number {
  const totalRounds = bracket.rounds.length;
  let max = 0;
  bracket.rounds.forEach((round, roundIndex) => {
    const weight = BRACKET_WINNER_POINTS[totalRounds - 1 - roundIndex] ?? 0;
    for (const slot of round.slots) {
      if (slot.kind !== "bye") {
        max += weight * 2;
      }
    }
  });
  return max;
}

export function pickableSlotCount(bracket: Bracket): number {
  let count = 0;
  for (const round of bracket.rounds) {
    for (const slot of round.slots) {
      if (slot.kind !== "bye") {
        count++;
      }
    }
  }
  return count;
}

export function slotCandidates(
  bracket: Bracket,
  roundIndex: number,
  slotIndex: number,
  pickedWinner: (roundIndex: number, slotIndex: number) => number | undefined,
): number[] {
  const round = bracket.rounds[roundIndex];
  const feed = round.feeders[slotIndex];
  if (!feed) {
    const slot = round.slots[slotIndex];
    if (slot.kind === "series") {
      return [slot.home.team.id, slot.away.team.id];
    }
    return [];
  }
  const previousRound = bracket.rounds[roundIndex - 1];
  const candidates: number[] = [];
  for (const previousIndex of feed) {
    const previousSlot = previousRound.slots[previousIndex];
    if (previousSlot.kind === "bye") {
      if (previousSlot.team) {
        candidates.push(previousSlot.team.id);
      }
      continue;
    }
    const winner = pickedWinner(roundIndex - 1, previousIndex);
    if (winner !== undefined) {
      candidates.push(winner);
    }
  }
  return candidates;
}

export type BracketValidation = { ok: true } | { ok: false; error: string };

export function validateBracketPicks(
  bracket: Bracket,
  picks: BracketPick[],
): BracketValidation {
  if (!bracket.isInferable || !bracket.seeded || bracket.rounds.length === 0) {
    return { ok: false, error: "Bracket is not open" };
  }

  const totalRounds = bracket.rounds.length;
  const pickByKey = new Map<string, BracketPick>();
  for (const pick of picks) {
    const key = `${pick.round}:${pick.slot}`;
    if (pickByKey.has(key)) {
      return { ok: false, error: "Duplicate pick slot" };
    }
    pickByKey.set(key, pick);
  }
  if (pickByKey.size !== pickableSlotCount(bracket)) {
    return { ok: false, error: "Submit a complete bracket" };
  }

  const pickedWinner = (roundIndex: number, slotIndex: number) =>
    pickByKey.get(`${totalRounds - 1 - roundIndex}:${slotIndex}`)?.teamId;

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const round = bracket.rounds[roundIndex];
    for (let slotIndex = 0; slotIndex < round.slots.length; slotIndex++) {
      const slot = round.slots[slotIndex];
      const fromEnd = totalRounds - 1 - roundIndex;
      const pick = pickByKey.get(`${fromEnd}:${slotIndex}`);
      if (slot.kind === "bye") {
        if (pick) {
          return { ok: false, error: "Byes cannot be picked" };
        }
        continue;
      }
      if (!pick) {
        return { ok: false, error: "Submit a complete bracket" };
      }
      if (
        pick.loserGames < 0 ||
        pick.loserGames > maxLoserGames(round.matchType)
      ) {
        return { ok: false, error: "Illegal series score" };
      }
      const candidates = slotCandidates(
        bracket,
        roundIndex,
        slotIndex,
        pickedWinner,
      );
      if (!candidates.includes(pick.teamId)) {
        return { ok: false, error: "Pick does not follow the bracket" };
      }
    }
  }
  return { ok: true };
}

export function realBracketResults(bracket: Bracket): BracketRoundResult[] {
  const totalRounds = bracket.rounds.length;
  return bracket.rounds.map((round, roundIndex) => {
    const loserGamesByWinner = new Map<number, number>();
    let resolvedCount = 0;
    for (const slot of round.slots) {
      if (slot.kind !== "series" || slot.status !== "complete") {
        continue;
      }
      const winner = slot.home.isWinner ? slot.home : slot.away;
      const loser = slot.home.isWinner ? slot.away : slot.home;
      loserGamesByWinner.set(winner.team.id, loser.score);
      resolvedCount++;
    }
    return {
      round: totalRounds - 1 - roundIndex,
      loserGamesByWinner,
      resolvedCount,
    };
  });
}

export function deriveBracketPicks(
  bracket: Bracket,
  stored: BracketPick[],
): BracketPick[] {
  const totalRounds = bracket.rounds.length;
  const storedByKey = new Map<string, BracketPick>();
  for (const pick of stored) {
    storedByKey.set(`${totalRounds - 1 - pick.round}:${pick.slot}`, pick);
  }

  const derived = new Map<string, BracketPick>();
  const derivedWinner = (roundIndex: number, slotIndex: number) =>
    derived.get(`${roundIndex}:${slotIndex}`)?.teamId;

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const round = bracket.rounds[roundIndex];
    const maxLoser = maxLoserGames(round.matchType);
    for (let slotIndex = 0; slotIndex < round.slots.length; slotIndex++) {
      if (round.slots[slotIndex].kind === "bye") {
        continue;
      }
      const key = `${roundIndex}:${slotIndex}`;
      const storedPick = storedByKey.get(key);
      if (!storedPick) {
        continue;
      }
      const candidateIds = slotCandidates(
        bracket,
        roundIndex,
        slotIndex,
        derivedWinner,
      );
      if (candidateIds[0] === undefined || candidateIds[1] === undefined) {
        continue;
      }
      if (storedPick.loserGames < 0 || storedPick.loserGames > maxLoser) {
        continue;
      }
      const winnerId =
        candidateIds[0] === storedPick.teamId
          ? candidateIds[0]
          : candidateIds[1];
      derived.set(key, {
        round: totalRounds - 1 - roundIndex,
        slot: slotIndex,
        teamId: winnerId,
        loserGames: storedPick.loserGames,
      });
    }
  }
  return [...derived.values()];
}

export function scoreBracketPicks(
  picks: BracketPick[],
  results: BracketRoundResult[],
): BracketScore {
  const resultByRound = new Map<number, BracketRoundResult>();
  let resolved = 0;
  for (const result of results) {
    resultByRound.set(result.round, result);
    resolved += result.resolvedCount;
  }

  let points = 0;
  let correct = 0;
  for (const pick of picks) {
    const result = resultByRound.get(pick.round);
    if (!result) {
      continue;
    }
    const realLoserGames = result.loserGamesByWinner.get(pick.teamId);
    if (realLoserGames === undefined) {
      continue;
    }
    const winnerPoints = BRACKET_WINNER_POINTS[pick.round] ?? 0;
    points += winnerPoints;
    correct += 1;
    if (realLoserGames === pick.loserGames) {
      points += winnerPoints;
    }
  }
  return { points, correct, resolved };
}
