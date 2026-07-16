import { Tier } from "@prisma/client";
import { ROLE_ORDER, type RoleName } from "@/lib/common/constants/roles";
import { normalizeAgentName } from "@/lib/common/agents";
import type { AgentCatalog } from "@/lib/queries/agents/getAgentCatalog";

export type StatRow = {
  season: number;
  datePlayed: Date;
  tier: Tier;
  team: number | null;
  winner: number | null;
  rounds: number;
  agent: string;
  role: RoleName | null;
  ratingAttack: number | null;
  ratingDefense: number | null;
  acs: number | null;
  kast: number | null;
  hsPercent: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  firstKills: number | null;
  firstDeaths: number | null;
  plants: number | null;
  defuses: number | null;
  tradeKills: number | null;
  tradeDeaths: number | null;
  ecoKills: number | null;
  antiEcoKills: number | null;
  clutches: number | null;
  damage: number | null;
};

export type RawStatRow = {
  agent: string;
  team: number | null;
  ratingAttack: number | null;
  ratingDefense: number | null;
  acs: number | null;
  kast: number | null;
  hsPercent: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  firstKills: number | null;
  firstDeaths: number | null;
  plants: number | null;
  defuses: number | null;
  tradeKills: number | null;
  tradeDeaths: number | null;
  ecoKills: number | null;
  antiEcoKills: number | null;
  clutches: number | null;
  damage: number | null;
  Game: {
    season: number;
    datePlayed: Date;
    tier: Tier;
    winner: number | null;
    rounds: number;
  };
};

export function toStatRows(
  rows: RawStatRow[],
  catalog: AgentCatalog,
): StatRow[] {
  return rows.map((row) => {
    const agentName = normalizeAgentName(row.agent);
    const role = catalog[agentName]?.role?.name ?? null;
    return {
      season: row.Game.season,
      datePlayed: row.Game.datePlayed,
      tier: row.Game.tier,
      team: row.team,
      winner: row.Game.winner,
      rounds: row.Game.rounds,
      agent: agentName,
      role,
      ratingAttack: row.ratingAttack,
      ratingDefense: row.ratingDefense,
      acs: row.acs,
      kast: row.kast,
      hsPercent: row.hsPercent,
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      firstKills: row.firstKills,
      firstDeaths: row.firstDeaths,
      plants: row.plants,
      defuses: row.defuses,
      tradeKills: row.tradeKills,
      tradeDeaths: row.tradeDeaths,
      ecoKills: row.ecoKills,
      antiEcoKills: row.antiEcoKills,
      clutches: row.clutches,
      damage: row.damage,
    };
  });
}

export type AggregatedStats = {
  games: number;
  rounds: number;
  wins: number;
  losses: number;
  winPct: number;
  acs: number;
  adr: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  kd: number;
  kda: number;
  kpr: number;
  apr: number;
  dpr: number;
  ratingOverall: number;
  ratingAttack: number;
  ratingDefense: number;
  kast: number;
  hsPercent: number;
  clutches: number;
  clutchesPerGame: number;
  firstKills: number;
  firstDeaths: number;
  fkPct: number;
  fdPct: number;
  fkMinusFd: number;
  fkpr: number;
  fdpr: number;
  ecoKills: number;
  antiEcoKills: number;
  tradeKills: number;
  tradeDeaths: number;
  plants: number;
  defuses: number;
};

const presentOrZero = (value: number | null) => value ?? 0;

const ratio = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : numerator / denominator;

const meanOfPresent = (values: Array<number | null>) => {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) return 0;
  const sum = present.reduce((total, value) => total + value, 0);
  return sum / present.length;
};

const sumOf = (rows: StatRow[], pick: (row: StatRow) => number | null) =>
  rows.reduce((total, row) => total + presentOrZero(pick(row)), 0);

export function aggregateStats(rows: StatRow[]): AggregatedStats {
  const games = rows.length;
  const rounds = rows.reduce((total, row) => total + row.rounds, 0);
  const wins = rows.filter(
    (row) => row.team !== null && row.team === row.winner,
  ).length;
  const losses = games - wins;

  const totalKills = sumOf(rows, (row) => row.kills);
  const totalDeaths = sumOf(rows, (row) => row.deaths);
  const totalAssists = sumOf(rows, (row) => row.assists);
  const totalDamage = sumOf(rows, (row) => row.damage);
  const firstKills = sumOf(rows, (row) => row.firstKills);
  const firstDeaths = sumOf(rows, (row) => row.firstDeaths);
  const clutches = sumOf(rows, (row) => row.clutches);

  const ratingAttack = meanOfPresent(rows.map((row) => row.ratingAttack));
  const ratingDefense = meanOfPresent(rows.map((row) => row.ratingDefense));

  return {
    games,
    rounds,
    wins,
    losses,
    winPct: games === 0 ? 0 : (wins / games) * 100,
    acs: meanOfPresent(rows.map((row) => row.acs)),
    adr: ratio(totalDamage, rounds),
    totalKills,
    totalDeaths,
    totalAssists,
    kd: ratio(totalKills, totalDeaths),
    kda: ratio(totalKills + totalAssists, totalDeaths),
    kpr: ratio(totalKills, rounds),
    apr: ratio(totalAssists, rounds),
    dpr: ratio(totalDeaths, rounds),
    ratingOverall: (ratingAttack + ratingDefense) / 2,
    ratingAttack,
    ratingDefense,
    kast: meanOfPresent(rows.map((row) => row.kast)),
    hsPercent: meanOfPresent(rows.map((row) => row.hsPercent)),
    clutches,
    clutchesPerGame: ratio(clutches, games),
    firstKills,
    firstDeaths,
    fkPct: ratio(firstKills, rounds) * 100,
    fdPct: ratio(firstDeaths, rounds) * 100,
    fkMinusFd: firstKills - firstDeaths,
    fkpr: ratio(firstKills, rounds),
    fdpr: ratio(firstDeaths, rounds),
    ecoKills: sumOf(rows, (row) => row.ecoKills),
    antiEcoKills: sumOf(rows, (row) => row.antiEcoKills),
    tradeKills: sumOf(rows, (row) => row.tradeKills),
    tradeDeaths: sumOf(rows, (row) => row.tradeDeaths),
    plants: sumOf(rows, (row) => row.plants),
    defuses: sumOf(rows, (row) => row.defuses),
  };
}

export function derivePrimaryRole(
  rows: ReadonlyArray<{ role: RoleName | null }>,
): RoleName | null {
  const counts: Record<RoleName, number> = {
    DUELIST: 0,
    CONTROLLER: 0,
    SENTINEL: 0,
    INITIATOR: 0,
  };
  let hasAnyRole = false;
  for (const row of rows) {
    if (row.role) {
      counts[row.role] += 1;
      hasAnyRole = true;
    }
  }
  if (!hasAnyRole) return null;
  let best: RoleName = ROLE_ORDER[0];
  for (const role of ROLE_ORDER) {
    if (counts[role] > counts[best]) best = role;
  }
  return best;
}

export type ComparableStat =
  | "acs"
  | "adr"
  | "ratingOverall"
  | "ratingAttack"
  | "ratingDefense"
  | "kast"
  | "hsPercent"
  | "kd"
  | "kpr"
  | "apr"
  | "fkPct"
  | "fdPct"
  | "clutchesPerGame";

export const COMPARABLE_STAT_LABELS: Record<ComparableStat, string> = {
  acs: "ACS",
  adr: "ADR",
  ratingOverall: "Rating",
  ratingAttack: "ATK Rating",
  ratingDefense: "DEF Rating",
  kast: "KAST%",
  hsPercent: "HS%",
  kd: "KD",
  kpr: "KPR",
  apr: "APR",
  fkPct: "FK%",
  fdPct: "FD%",
  clutchesPerGame: "Clutch/Game",
};

export const LOWER_IS_BETTER: ReadonlySet<ComparableStat> = new Set(["fdPct"]);

const PERCENT_STATS: ReadonlySet<ComparableStat> = new Set([
  "kast",
  "hsPercent",
  "fkPct",
  "fdPct",
]);
const WHOLE_NUMBER_STATS: ReadonlySet<ComparableStat> = new Set(["acs", "adr"]);

export function formatStatValue(stat: ComparableStat, value: number): string {
  if (PERCENT_STATS.has(stat)) return `${value.toFixed(0)}%`;
  if (WHOLE_NUMBER_STATS.has(stat)) return value.toFixed(0);
  return value.toFixed(2);
}

export const RADAR_STATS: ComparableStat[] = [
  "acs",
  "kast",
  "fkPct",
  "hsPercent",
  "kd",
  "clutchesPerGame",
];

export type PeerRow = {
  userId: string;
  ign: string | null;
  primaryRole: RoleName | null;
  tier: Tier | null;
  games: number;
  stats: Record<ComparableStat, number>;
};

export function toPeerStats(
  agg: AggregatedStats,
): Record<ComparableStat, number> {
  return {
    acs: agg.acs,
    adr: agg.adr,
    ratingOverall: agg.ratingOverall,
    ratingAttack: agg.ratingAttack,
    ratingDefense: agg.ratingDefense,
    kast: agg.kast,
    hsPercent: agg.hsPercent,
    kd: agg.kd,
    kpr: agg.kpr,
    apr: agg.apr,
    fkPct: agg.fkPct,
    fdPct: agg.fdPct,
    clutchesPerGame: agg.clutchesPerGame,
  };
}

export type RoleFilter = RoleName | "ANY";
export type TierFilter = Tier | "ANY";

export function filterPeers(
  pool: PeerRow[],
  filters: { role: RoleFilter; tier: TierFilter },
): PeerRow[] {
  return pool.filter((peer) => {
    const roleMatches =
      filters.role === "ANY" || peer.primaryRole === filters.role;
    const tierMatches = filters.tier === "ANY" || peer.tier === filters.tier;
    return roleMatches && tierMatches;
  });
}

const LEADER_MIN_GAMES = 2;

export function bestPeer(
  peers: PeerRow[],
  stat: ComparableStat,
): PeerRow | null {
  const qualified = peers.filter((peer) => peer.games >= LEADER_MIN_GAMES);
  if (qualified.length === 0) return null;
  const lowerIsBetter = LOWER_IS_BETTER.has(stat);
  return qualified.reduce((best, peer) => {
    const peerIsBetter = lowerIsBetter
      ? peer.stats[stat] < best.stats[stat]
      : peer.stats[stat] > best.stats[stat];
    return peerIsBetter ? peer : best;
  });
}

export type Distribution = {
  count: number;
  percentile: number;
  rank: number;
  min: number;
  median: number;
  max: number;
};

export function percentileAndRank(
  value: number,
  peerValues: number[],
  lowerIsBetter: boolean,
): Distribution | null {
  if (peerValues.length === 0) return null;
  const sorted = [...peerValues].sort((a, b) => a - b);
  const count = sorted.length;
  const worseCount = sorted.filter((peerValue) =>
    lowerIsBetter ? peerValue > value : peerValue < value,
  ).length;
  const betterCount = sorted.filter((peerValue) =>
    lowerIsBetter ? peerValue < value : peerValue > value,
  ).length;
  const percentile =
    count <= 1 ? 100 : Math.round((worseCount / (count - 1)) * 100);
  const rank = betterCount + 1;
  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return {
    count,
    percentile,
    rank,
    min: sorted[0],
    median,
    max: sorted[count - 1],
  };
}

export type TrendMetric =
  | "rating"
  | "acs"
  | "adr"
  | "kast"
  | "kd"
  | "hsPercent";

export const TREND_METRIC_TO_COMPARABLE: Record<TrendMetric, ComparableStat> = {
  rating: "ratingOverall",
  acs: "acs",
  adr: "adr",
  kast: "kast",
  kd: "kd",
  hsPercent: "hsPercent",
};

export function averageTrendMetrics(
  peers: PeerRow[],
): Record<TrendMetric, number> | null {
  if (peers.length === 0) return null;
  const metrics = Object.keys(TREND_METRIC_TO_COMPARABLE) as TrendMetric[];
  const averages = {} as Record<TrendMetric, number>;
  for (const metric of metrics) {
    const stat = TREND_METRIC_TO_COMPARABLE[metric];
    const total = peers.reduce((sum, peer) => sum + peer.stats[stat], 0);
    averages[metric] = total / peers.length;
  }
  return averages;
}

export const TREND_METRIC_LABELS: Record<TrendMetric, string> = {
  rating: "Rating",
  acs: "ACS",
  adr: "ADR",
  kast: "KAST%",
  kd: "K/D",
  hsPercent: "HS%",
};

export type TrendPoint = {
  index: number;
  date: Date;
  season: number;
  value: number;
};

function metricValue(row: StatRow, metric: TrendMetric): number {
  switch (metric) {
    case "rating":
      return (
        (presentOrZero(row.ratingAttack) + presentOrZero(row.ratingDefense)) / 2
      );
    case "acs":
      return presentOrZero(row.acs);
    case "adr":
      return ratio(presentOrZero(row.damage), row.rounds);
    case "kast":
      return presentOrZero(row.kast);
    case "kd":
      return ratio(presentOrZero(row.kills), presentOrZero(row.deaths));
    case "hsPercent":
      return presentOrZero(row.hsPercent);
  }
}

export function chronological(rows: StatRow[]): StatRow[] {
  return [...rows].sort(
    (a, b) =>
      new Date(a.datePlayed).getTime() - new Date(b.datePlayed).getTime(),
  );
}

export function buildTrendSeries(
  rows: StatRow[],
  metric: TrendMetric,
): TrendPoint[] {
  return chronological(rows).map((row, index) => ({
    index,
    date: row.datePlayed,
    season: row.season,
    value: Number(metricValue(row, metric).toFixed(2)),
  }));
}

export function seasonBoundaryIndices(rows: StatRow[]): number[] {
  const sorted = chronological(rows);
  const boundaries: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].season !== sorted[i - 1].season) boundaries.push(i);
  }
  return boundaries;
}

export type TrendDirection = "up" | "down" | "steady";

export function ratingTrend(
  rows: StatRow[],
): { direction: TrendDirection; delta: number; window: number } | null {
  const series = buildTrendSeries(rows, "rating");
  if (series.length < 5) return null;
  const pointCount = series.length;
  const indices = series.map((point) => point.index);
  const values = series.map((point) => point.value);
  const meanIndex =
    indices.reduce((total, value) => total + value, 0) / pointCount;
  const meanValue =
    values.reduce((total, value) => total + value, 0) / pointCount;
  let covariance = 0;
  let variance = 0;
  for (let i = 0; i < pointCount; i += 1) {
    covariance += (indices[i] - meanIndex) * (values[i] - meanValue);
    variance += (indices[i] - meanIndex) ** 2;
  }
  const slope = variance === 0 ? 0 : covariance / variance;
  const delta = Number((slope * (pointCount - 1)).toFixed(2));
  const direction: TrendDirection =
    delta > 0.05 ? "up" : delta < -0.05 ? "down" : "steady";
  return { direction, delta, window: pointCount };
}

export function bestSeasonByRating(
  rows: StatRow[],
): { season: number; rating: number } | null {
  const rowsBySeason = new Map<number, StatRow[]>();
  for (const row of rows) {
    const seasonRows = rowsBySeason.get(row.season) ?? [];
    seasonRows.push(row);
    rowsBySeason.set(row.season, seasonRows);
  }
  if (rowsBySeason.size < 2) return null;
  let best: { season: number; rating: number } | null = null;
  for (const [season, seasonRows] of rowsBySeason) {
    const rating = aggregateStats(seasonRows).ratingOverall;
    if (!best || rating > best.rating) best = { season, rating };
  }
  return best;
}

export function bestRoleByRating(
  rows: StatRow[],
): { role: RoleName; rating: number } | null {
  const rowsByRole = new Map<RoleName, StatRow[]>();
  for (const row of rows) {
    if (!row.role) continue;
    const roleRows = rowsByRole.get(row.role) ?? [];
    roleRows.push(row);
    rowsByRole.set(row.role, roleRows);
  }
  if (rowsByRole.size < 2) return null;
  let best: { role: RoleName; rating: number } | null = null;
  for (const [role, roleRows] of rowsByRole) {
    const rating = aggregateStats(roleRows).ratingOverall;
    if (!best || rating > best.rating) best = { role, rating };
  }
  return best;
}

export type Insight = {
  key: string;
  label: string;
  value: string;
  sub?: string;
  direction?: TrendDirection;
};

const STANDOUT_MIN_PEERS = 8;
const STANDOUT_MIN_GAMES = 5;

function capitalize(string: string) {
  const firstWord = string.charAt(0).toUpperCase();
  const restLowercased = string.slice(1).toLowerCase();
  return firstWord + restLowercased;
}

export function buildInsights(args: {
  rows: StatRow[];
  agg: AggregatedStats;
  primaryRole: RoleName | null;
  selfTier: Tier | null;
  peers: PeerRow[];
  scope: "season" | "career";
}): Insight[] {
  const { rows, agg, primaryRole, selfTier, peers, scope } = args;
  const insights: Insight[] = [];

  if (peers.length >= STANDOUT_MIN_PEERS && agg.games >= STANDOUT_MIN_GAMES) {
    let bestStat: { stat: ComparableStat; pct: number } | null = null;
    for (const stat of RADAR_STATS) {
      const dist = percentileAndRank(
        agg[stat],
        peers.map((peer) => peer.stats[stat]),
        LOWER_IS_BETTER.has(stat),
      );
      if (dist && (!bestStat || dist.percentile > bestStat.pct)) {
        bestStat = { stat, pct: dist.percentile };
      }
    }
    if (bestStat) {
      const roleLabel = primaryRole ? `${primaryRole.toLowerCase()}s` : "peers";
      const tierLabel = selfTier ? `${selfTier.toLowerCase()} ` : "";

      insights.push({
        key: "standout",
        label: "Standout",
        value: `Top ${Math.max(1, 100 - bestStat.pct)}%`,
        sub: `${COMPARABLE_STAT_LABELS[bestStat.stat]} · ${capitalize(tierLabel)}${capitalize(roleLabel)}`,
      });
    }
  }

  const trend = ratingTrend(rows);
  if (trend) {
    const sign = trend.delta > 0 ? "+" : "";
    insights.push({
      key: "trend",
      label: "Trend",
      value: "Rating",
      sub: `${sign}${trend.delta} / last ${trend.window}`,
      direction: trend.direction,
    });
  }

  if (scope === "career") {
    const peakSeason = bestSeasonByRating(rows);
    if (peakSeason) {
      insights.push({
        key: "peak",
        label: "Peak Rating",
        value: peakSeason.rating.toFixed(2),
        sub: `best season: S${peakSeason.season}`,
      });
    }
  } else {
    const peakRole = bestRoleByRating(rows);
    if (peakRole) {
      insights.push({
        key: "peak",
        label: "Peak Rating",
        value: peakRole.rating.toFixed(2),
        sub: `BEST ROLE: ${titleCaseRole(peakRole.role)}`,
      });
    }
  }

  insights.push({
    key: "identity",
    label: "Identity",
    value: primaryRole ? titleCaseRole(primaryRole) : "Flex",
    sub: `${agg.games} games · ${Math.round(agg.winPct)}% WR`,
  });

  return insights;
}

export function titleCaseRole(role: RoleName): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod100 = n % 100;
  return n + (suffixes[(mod100 - 20) % 10] ?? suffixes[mod100] ?? suffixes[0]);
}
