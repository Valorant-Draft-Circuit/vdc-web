const PRODUCTION_ORIGINS = ["https://vdc.gg", "https://www.vdc.gg"];

const PREVIEW_ORIGIN_SUFFIX = ".vercel.app";

const DEVELOPMENT_ORIGINS = ["http://localhost:3000"];

const ORIGIN_EXEMPT_PATH_PATTERNS: RegExp[] = [
  /^\/api\/auth\//,
  /^\/api\/internal\/health$/,
];

export function isOriginExemptPath(pathname: string): boolean {
  return ORIGIN_EXEMPT_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  if (PRODUCTION_ORIGINS.some((allowed) => origin === allowed)) return true;
  if (DEVELOPMENT_ORIGINS.some((allowed) => origin.startsWith(allowed))) return true;

  try {
    const host = new URL(origin).host;
    if (host.endsWith(PREVIEW_ORIGIN_SUFFIX)) return true;
  } catch {
    return false;
  }

  return false;
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
