/**
 * Makes a client-supplied value safe to interpolate into a log line by
 * removing line breaks (CR, LF, U+2028, U+2029) and other control
 * characters, so a crafted value cannot forge extra log entries or inject
 * terminal escape sequences.
 */
export function sanitizeForLog(value: unknown): string {
  return String(value).replace(/[\r\n\u2028\u2029\p{Cc}]/gu, "");
}
