import { format, startOfMonth, startOfWeek, subMonths, subWeeks } from "date-fns";

export type TrendPoint = { label: string; count: number };

export type SeasonBoundary = { season: number; firstMatch: Date };

export type SignupTrend = {
  weekly: TrendPoint[];
  monthly: TrendPoint[];
  bySeason: TrendPoint[];
};

export function bucketByWeek(dates: Date[], now: Date, windowWeeks: number): TrendPoint[] {
  const buckets = buildPeriodBuckets(now, windowWeeks, (anchor, offset) =>
    startOfWeek(subWeeks(anchor, offset)),
  ).map((start) => ({ startMs: start.getTime(), label: format(start, "MMM d"), count: 0 }));

  for (const date of dates) {
    const startMs = startOfWeek(date).getTime();
    const bucket = buckets.find((candidate) => candidate.startMs === startMs);
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

export function bucketByMonth(dates: Date[], now: Date, windowMonths: number): TrendPoint[] {
  const buckets = buildPeriodBuckets(now, windowMonths, (anchor, offset) =>
    startOfMonth(subMonths(anchor, offset)),
  ).map((start) => ({ startMs: start.getTime(), label: format(start, "MMM yyyy"), count: 0 }));

  for (const date of dates) {
    const startMs = startOfMonth(date).getTime();
    const bucket = buckets.find((candidate) => candidate.startMs === startMs);
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

export function bucketBySeason(dates: Date[], boundaries: SeasonBoundary[]): TrendPoint[] {
  if (boundaries.length === 0) return [];

  const ordered = [...boundaries].sort((a, b) => a.firstMatch.getTime() - b.firstMatch.getTime());
  const latestSeason = ordered[ordered.length - 1].season;
  const counts = new Map<number, number>(ordered.map((boundary) => [boundary.season, 0]));

  for (const date of dates) {
    const enclosing = ordered.find((boundary) => date.getTime() < boundary.firstMatch.getTime());
    const season = enclosing ? enclosing.season : latestSeason;
    counts.set(season, (counts.get(season) ?? 0) + 1);
  }

  return ordered.map((boundary) => ({
    label: `S${boundary.season}`,
    count: counts.get(boundary.season) ?? 0,
  }));
}

function buildPeriodBuckets(
  now: Date,
  windowSize: number,
  startOfPeriodAgo: (anchor: Date, offset: number) => Date,
): Date[] {
  const starts: Date[] = [];
  for (let offset = windowSize - 1; offset >= 0; offset--) {
    starts.push(startOfPeriodAgo(now, offset));
  }
  return starts;
}
