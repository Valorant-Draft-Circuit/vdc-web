import type { MatchOutcome, ResolvedMatch } from "./resolve";

export type OutcomeCounts = { home: number; draw: number; away: number };
export type ScorePick = { home: number; away: number };

export type MatchupSentiment = {
  matchId: number;
  totalPicks: number;
  counts: OutcomeCounts;
  shares: OutcomeCounts;
  consensus: MatchOutcome;
  consensusShare: number;
  topScoreline: string;
};

const OUTCOME_TIE_ORDER: MatchOutcome[] = ["HOME", "AWAY", "DRAW"];

function topByCount<T>(
  entries: Iterable<[T, number]>,
  preferOnTie: (candidate: T, current: T) => boolean,
): { key: T; count: number } | null {
  let bestKey: T | null = null;
  let bestCount = -1;
  for (const [key, count] of entries) {
    if (
      count > bestCount ||
      (count === bestCount && bestKey !== null && preferOnTie(key, bestKey))
    ) {
      bestCount = count;
      bestKey = key;
    }
  }
  return bestKey === null ? null : { key: bestKey, count: bestCount };
}

export function tallyMatchup(
  matchId: number,
  picks: ScorePick[],
): MatchupSentiment {
  const counts: OutcomeCounts = { home: 0, draw: 0, away: 0 };
  const scorelineCounts = new Map<string, number>();
  for (const pick of picks) {
    const outcome: MatchOutcome =
      pick.home > pick.away ? "HOME" : pick.away > pick.home ? "AWAY" : "DRAW";
    if (outcome === "HOME") {
      counts.home += 1;
    } else if (outcome === "AWAY") {
      counts.away += 1;
    } else {
      counts.draw += 1;
    }
    const key = `${pick.home}-${pick.away}`;
    scorelineCounts.set(key, (scorelineCounts.get(key) ?? 0) + 1);
  }

  const totalPicks = picks.length;
  const shareOf = (value: number) => (totalPicks === 0 ? 0 : value / totalPicks);
  const shares: OutcomeCounts = {
    home: shareOf(counts.home),
    draw: shareOf(counts.draw),
    away: shareOf(counts.away),
  };

  const countByOutcome: Record<MatchOutcome, number> = {
    HOME: counts.home,
    AWAY: counts.away,
    DRAW: counts.draw,
  };
  let consensus: MatchOutcome = "HOME";
  let best = -1;
  for (const outcome of OUTCOME_TIE_ORDER) {
    if (countByOutcome[outcome] > best) {
      best = countByOutcome[outcome];
      consensus = outcome;
    }
  }

  const top = topByCount(scorelineCounts, (a, b) => a < b);
  const topScoreline = top?.key ?? "";

  return {
    matchId,
    totalPicks,
    counts,
    shares,
    consensus,
    consensusShare: shareOf(countByOutcome[consensus]),
    topScoreline,
  };
}

export type MatchConsensusOutcome = {
  matchId: number;
  consensus: MatchOutcome;
  consensusShare: number;
  actual: MatchOutcome;
};

export type MatchUpset = MatchConsensusOutcome;
export type MatchChalk = MatchConsensusOutcome;

function collectResolvedConsensus(
  entries: { sentiment: MatchupSentiment; result: ResolvedMatch }[],
  keep: (crowdWasRight: boolean) => boolean,
): MatchConsensusOutcome[] {
  const collected: MatchConsensusOutcome[] = [];
  for (const { sentiment, result } of entries) {
    if (!result.resolved || result.outcome === null) {
      continue;
    }
    if (sentiment.totalPicks === 0) {
      continue;
    }
    const crowdWasRight = result.outcome === sentiment.consensus;
    if (keep(crowdWasRight)) {
      collected.push({
        matchId: sentiment.matchId,
        consensus: sentiment.consensus,
        consensusShare: sentiment.consensusShare,
        actual: result.outcome,
      });
    }
  }
  return collected.sort((a, b) => b.consensusShare - a.consensusShare);
}

export function findMatchUpsets(
  entries: { sentiment: MatchupSentiment; result: ResolvedMatch }[],
): MatchUpset[] {
  return collectResolvedConsensus(entries, (crowdWasRight) => !crowdWasRight);
}

export function findMatchChalk(
  entries: { sentiment: MatchupSentiment; result: ResolvedMatch }[],
): MatchChalk[] {
  return collectResolvedConsensus(entries, (crowdWasRight) => crowdWasRight);
}

export type AdvanceSentimentRow = {
  teamId: number;
  count: number;
  share: number;
  consensusSeed: number;
};

export function tallyAdvancement(
  picksByUser: Map<string, { teamId: number; seed: number }[]>,
): { rows: AdvanceSentimentRow[]; voters: number } {
  const voters = picksByUser.size;
  const teamCounts = new Map<number, number>();
  const seedCounts = new Map<number, Map<number, number>>();
  for (const picks of picksByUser.values()) {
    for (const pick of picks) {
      teamCounts.set(pick.teamId, (teamCounts.get(pick.teamId) ?? 0) + 1);
      if (!seedCounts.has(pick.teamId)) {
        seedCounts.set(pick.teamId, new Map());
      }
      const seedMap = seedCounts.get(pick.teamId)!;
      seedMap.set(pick.seed, (seedMap.get(pick.seed) ?? 0) + 1);
    }
  }

  const rows: AdvanceSentimentRow[] = [];
  for (const [teamId, count] of teamCounts) {
    const topSeed = topByCount(seedCounts.get(teamId)!, (a, b) => a < b);
    const consensusSeed = topSeed?.key ?? 0;
    rows.push({
      teamId,
      count,
      share: voters === 0 ? 0 : count / voters,
      consensusSeed,
    });
  }
  rows.sort((a, b) => b.share - a.share || a.consensusSeed - b.consensusSeed);
  return { rows, voters };
}

export function findMissedCut(
  rows: AdvanceSentimentRow[],
  advancedIds: Set<number>,
  limit = 5,
): AdvanceSentimentRow[] {
  const missed = rows.filter((row) => !advancedIds.has(row.teamId));
  return missed.slice(0, limit);
}

export function findSurpriseAdvancers(
  rows: AdvanceSentimentRow[],
  advancedIds: Set<number>,
  limit = 5,
): AdvanceSentimentRow[] {
  const rowByTeam = new Map<number, AdvanceSentimentRow>();
  for (const row of rows) {
    rowByTeam.set(row.teamId, row);
  }

  const surprises: AdvanceSentimentRow[] = [];
  for (const teamId of advancedIds) {
    const row = rowByTeam.get(teamId) ?? {
      teamId,
      count: 0,
      share: 0,
      consensusSeed: 0,
    };
    if (row.share < 0.5) {
      surprises.push(row);
    }
  }

  surprises.sort((a, b) => a.share - b.share || a.teamId - b.teamId);
  return surprises.slice(0, limit);
}

export type SlotConsensus = {
  round: number;
  slot: number;
  teamId: number;
  count: number;
  total: number;
  share: number;
};

export function tallyBracketSlots(
  picks: { round: number; slot: number; teamId: number }[],
): SlotConsensus[] {
  const bySlot = new Map<string, Map<number, number>>();
  for (const pick of picks) {
    const key = `${pick.round}:${pick.slot}`;
    if (!bySlot.has(key)) {
      bySlot.set(key, new Map());
    }
    const teamMap = bySlot.get(key)!;
    teamMap.set(pick.teamId, (teamMap.get(pick.teamId) ?? 0) + 1);
  }

  const result: SlotConsensus[] = [];
  for (const [key, teamMap] of bySlot) {
    const [roundStr, slotStr] = key.split(":");
    let total = 0;
    for (const count of teamMap.values()) {
      total += count;
    }
    const top = topByCount(teamMap, (a, b) => a < b);
    result.push({
      round: Number(roundStr),
      slot: Number(slotStr),
      teamId: top?.key ?? 0,
      count: top?.count ?? 0,
      total,
      share: total === 0 ? 0 : (top?.count ?? 0) / total,
    });
  }
  return result;
}
