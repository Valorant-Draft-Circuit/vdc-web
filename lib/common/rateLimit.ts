type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 50_000;

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Fixed-window limiter. The app runs as a single process, so in-memory state is sufficient. */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) prune(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

type HeaderSource = { get(name: string): string | null };

export function clientIpFrom(headerSource: HeaderSource): string {
  return (
    headerSource.get("cf-connecting-ip") ??
    headerSource.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
