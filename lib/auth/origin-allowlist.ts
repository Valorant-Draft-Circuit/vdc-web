const ORIGIN_EXEMPT_PATH_PATTERNS: RegExp[] = [
  /^\/api\/auth\//,
  /^\/api\/internal\/health$/,
  /^\/api\/internal\/meilisearch\/documents\/players$/,
  /^\/api\/internal\/meilisearch\/index\/[^/]+$/,
];

export function isOriginExemptPath(pathname: string): boolean {
  return ORIGIN_EXEMPT_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function getAllowedOrigins(): string[] {
  const allowed: string[] = [];

  if (process.env.AUTH_URL) {
    allowed.push(stripTrailingSlashes(process.env.AUTH_URL));
  }

  const extra = process.env.ALLOWED_API_ORIGINS;
  if (extra) {
    for (const raw of extra.split(",")) {
      const trimmed = stripTrailingSlashes(raw.trim());
      if (trimmed) allowed.push(trimmed);
    }
  }

  return allowed;
}

function getAllowedOriginSuffixes(): string[] {
  const suffixes = process.env.ALLOWED_API_ORIGIN_SUFFIXES;
  if (!suffixes) return [];

  return suffixes
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  const normalized = stripTrailingSlashes(origin);
  if (getAllowedOrigins().some((allowed) => allowed === normalized)) return true;

  const suffixes = getAllowedOriginSuffixes();
  if (suffixes.length === 0) return false;

  try {
    const host = new URL(normalized).host;
    return suffixes.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

export function extractRequestOrigin(headers: Headers): string | null {
  const originHeader = headers.get("origin");
  if (originHeader) return originHeader;

  const refererHeader = headers.get("referer");
  if (!refererHeader) return null;

  try {
    const refererUrl = new URL(refererHeader);
    return `${refererUrl.protocol}//${refererUrl.host}`;
  } catch {
    return null;
  }
}
