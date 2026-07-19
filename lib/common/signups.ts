import { format, startOfMonth, startOfWeek, subMonths, subWeeks } from "date-fns";

export type TrendPoint = { label: string; count: number };

export type SeasonBoundary = { season: number; firstMatch: Date };

export type TrendSeries = {
  cumulative: TrendPoint[];
  newPerPeriod: TrendPoint[];
};

export type SignupTrend = {
  weekly: TrendSeries;
  monthly: TrendSeries;
  bySeason: TrendSeries;
};

export function weeklySignupSeries(
  signupDates: Date[],
  now: Date,
  windowWeeks: number,
): TrendSeries {
  const weekStarts = buildPeriodBuckets(now, windowWeeks, (anchor, offset) =>
    startOfWeek(subWeeks(anchor, offset)),
  );
  const labelFor = (start: Date) => format(start, "MMM d");

  return {
    cumulative: cumulativeAtPeriodEnds(signupDates, weekStarts, labelFor),
    newPerPeriod: countsPerPeriod(signupDates, weekStarts, labelFor, (date) =>
      startOfWeek(date),
    ),
  };
}

export function monthlySignupSeries(
  signupDates: Date[],
  now: Date,
  windowMonths: number,
): TrendSeries {
  const monthStarts = buildPeriodBuckets(now, windowMonths, (anchor, offset) =>
    startOfMonth(subMonths(anchor, offset)),
  );
  const labelFor = (start: Date) => format(start, "MMM yyyy");

  return {
    cumulative: cumulativeAtPeriodEnds(signupDates, monthStarts, labelFor),
    newPerPeriod: countsPerPeriod(signupDates, monthStarts, labelFor, (date) =>
      startOfMonth(date),
    ),
  };
}

export function seasonSignupSeries(
  signupDates: Date[],
  boundaries: SeasonBoundary[],
): TrendSeries {
  if (boundaries.length === 0) return { cumulative: [], newPerPeriod: [] };

  const ordered = [...boundaries].sort(
    (a, b) => a.firstMatch.getTime() - b.firstMatch.getTime(),
  );
  const latestSeason = ordered[ordered.length - 1].season;
  const sortedTimestamps = sortedTimestampsOf(signupDates);

  const cumulative = ordered.map((boundary, index) => {
    const nextBoundary = ordered[index + 1];
    const cutoffMs = nextBoundary
      ? nextBoundary.firstMatch.getTime()
      : Number.POSITIVE_INFINITY;
    return {
      label: `S${boundary.season}`,
      count: countBefore(sortedTimestamps, cutoffMs),
    };
  });

  const countsBySeason = new Map<number, number>(
    ordered.map((boundary) => [boundary.season, 0]),
  );
  for (const date of signupDates) {
    const enclosing = ordered.find(
      (boundary) => date.getTime() < boundary.firstMatch.getTime(),
    );
    const season = enclosing ? enclosing.season : latestSeason;
    countsBySeason.set(season, (countsBySeason.get(season) ?? 0) + 1);
  }
  const newPerPeriod = ordered.map((boundary) => ({
    label: `S${boundary.season}`,
    count: countsBySeason.get(boundary.season) ?? 0,
  }));

  return { cumulative, newPerPeriod };
}

function cumulativeAtPeriodEnds(
  signupDates: Date[],
  periodStarts: Date[],
  labelFor: (start: Date) => string,
): TrendPoint[] {
  const sortedTimestamps = sortedTimestampsOf(signupDates);

  return periodStarts.map((start, index) => {
    const nextStart = periodStarts[index + 1];
    const cutoffMs = nextStart ? nextStart.getTime() : Number.POSITIVE_INFINITY;
    return {
      label: labelFor(start),
      count: countBefore(sortedTimestamps, cutoffMs),
    };
  });
}

function countsPerPeriod(
  signupDates: Date[],
  periodStarts: Date[],
  labelFor: (start: Date) => string,
  periodStartOf: (date: Date) => Date,
): TrendPoint[] {
  const buckets = periodStarts.map((start) => ({
    startMs: start.getTime(),
    label: labelFor(start),
    count: 0,
  }));

  for (const date of signupDates) {
    const startMs = periodStartOf(date).getTime();
    const bucket = buckets.find((candidate) => candidate.startMs === startMs);
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

function sortedTimestampsOf(dates: Date[]): number[] {
  return dates.map((date) => date.getTime()).sort((a, b) => a - b);
}

function countBefore(sortedTimestamps: number[], cutoffMs: number): number {
  let count = 0;
  for (const timestamp of sortedTimestamps) {
    if (timestamp >= cutoffMs) break;
    count += 1;
  }
  return count;
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
