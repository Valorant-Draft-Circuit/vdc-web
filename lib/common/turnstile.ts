const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5_000;

export const SIGNUP_CAPTCHA_ACTION = "signup";

type VerifyOptions = {
  remoteIp?: string;
  /** The action the widget was rendered with; a token solved for another form is rejected. */
  expectedAction?: string;
  /** When non-empty, the token must have been solved on one of these hostnames. */
  allowedHostnames?: string[];
};

type VerifyResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
};

export function parseHostnameList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter((hostname) => hostname.length > 0);
}

/** Confirms a captcha token with Cloudflare. Tokens are single-use, so call this once per submit. */
export async function verifyTurnstileToken(
  secret: string,
  token: unknown,
  options: VerifyOptions = {},
): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  const { remoteIp, expectedAction, allowedHostnames = [] } = options;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    if (!res.ok) return false;

    const result = (await res.json()) as VerifyResponse;
    if (result.success !== true) return false;
    if (expectedAction && result.action !== expectedAction) return false;
    if (
      allowedHostnames.length > 0 &&
      !allowedHostnames.includes((result.hostname ?? "").toLowerCase())
    ) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return false;
  }
}
