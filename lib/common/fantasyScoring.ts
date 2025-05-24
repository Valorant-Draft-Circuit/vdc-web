export const WEIGHTS = {
  kills: 10,
  deaths: -11,
  firstKills: 5,
  firstDeaths: -6,
  tradeKills: -3,
  tradeDeaths: 4,
};

export function calculateFantasyPoints(stats: Record<string, number>): number {
  let points = 0;
  for (const [statKey, weight] of Object.entries(WEIGHTS)) {
    points += (stats[statKey] ?? 0) * weight;
  }
  return points;
}

export function getPercentile(allAvgPoints: number[], target: number): number {
  const below = allAvgPoints.filter(p => p < target).length;
  const equal = allAvgPoints.filter(p => p === target).length;
  return (below + 0.5 * equal) / allAvgPoints.length;
}

export function calculatePlayerCost(percentile: number): number {
  const clamped = Math.min(Math.max(percentile, 0), 1); // ensures it's between 0 and 1
  const cost = 150000 + clamped * 100000;
  return Math.ceil(cost);
}

