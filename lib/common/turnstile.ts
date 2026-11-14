const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5_000;

/** Confirms a captcha token with Cloudflare. Tokens are single-use, so call this once per submit. */
export async function verifyTurnstileToken(
  secret: string,
  token: unknown,
  remoteIp?: string,
): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return false;
  }
}
