import type { PlayerMapBreakdown } from "@/lib/queries/stats/getPlayerMapBreakdown";

export type MapRow = PlayerMapBreakdown & { splashUrl: string | null };

export const CALLOUT_MIN_GAMES = 2;

export function overallRating(row: PlayerMapBreakdown): number {
  return (row.averages.ratingAttack + row.averages.ratingDefense) / 2;
}

export function winPercent(row: PlayerMapBreakdown): number {
  return row.gamesPlayed === 0 ? 0 : (row.wins / row.gamesPlayed) * 100;
}

export function killDeathRatio(row: PlayerMapBreakdown): number {
  return row.totals.deaths === 0
    ? row.totals.kills
    : row.totals.kills / row.totals.deaths;
}

export type WinRateBucket = "high" | "mid" | "low";

export function winRateBucket(winPct: number): WinRateBucket {
  if (winPct >= 55) return "high";
  if (winPct >= 45) return "mid";
  return "low";
}

export function ratingBucket(rating: number): WinRateBucket {
  if (rating >= 1.05) return "high";
  if (rating >= 0.95) return "mid";
  return "low";
}

export type MapCallouts = {
  best: MapRow | null;
  worst: MapRow | null;
  mostPlayed: MapRow | null;
};

export type CalloutMetric = "winrate" | "rating";

function metricValue(row: MapRow, metric: CalloutMetric): number {
  return metric === "winrate" ? winPercent(row) : overallRating(row);
}

function hasBetterMetric(
  candidate: MapRow,
  current: MapRow,
  metric: CalloutMetric,
): boolean {
  const candidateValue = metricValue(candidate, metric);
  const currentValue = metricValue(current, metric);
  if (candidateValue !== currentValue) return candidateValue > currentValue;
  if (metric === "winrate") {
    return overallRating(candidate) > overallRating(current);
  }
  return candidate.gamesPlayed > current.gamesPlayed;
}

export function selectMapCallouts(
  rows: MapRow[],
  metric: CalloutMetric = "winrate",
): MapCallouts {
  const qualified = rows.filter((row) => row.gamesPlayed >= CALLOUT_MIN_GAMES);

  let best: MapRow | null = null;
  let worst: MapRow | null = null;
  for (const row of qualified) {
    if (best === null || hasBetterMetric(row, best, metric)) best = row;
    if (worst === null || hasBetterMetric(worst, row, metric)) worst = row;
  }

  let mostPlayed: MapRow | null = null;
  for (const row of rows) {
    if (mostPlayed === null || row.gamesPlayed > mostPlayed.gamesPlayed) {
      mostPlayed = row;
    }
  }

  // With only one qualifying map, best and worst collapse to the same row; show only best.
  if (best && worst && best.map === worst.map) worst = null;

  return { best, worst, mostPlayed };
}
