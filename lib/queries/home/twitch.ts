import { Times } from "@/lib/common/times";

const CHANNEL_LOGIN = "valorantdraftcircuit";
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const STREAMS_URL = `https://api.twitch.tv/helix/streams?user_login=${CHANNEL_LOGIN}`;
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

type TokenResponse = { access_token: string; expires_in: number };
type StreamsResponse = { data: Array<{ type: string }> };

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAppToken(
  clientId: string,
  clientSecret: string,
): Promise<string | null> {
  if (
    cachedToken &&
    cachedToken.expiresAt > Date.now() + TOKEN_REFRESH_MARGIN_MS
  ) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch(TOKEN_URL, { method: "POST", body });
  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as TokenResponse;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

export async function isTwitchLive(): Promise<boolean> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return false;
  }

  try {
    const token = await getAppToken(clientId, clientSecret);
    if (!token) {
      return false;
    }

    const res = await fetch(STREAMS_URL, {
      headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` },
      next: { revalidate: Times.MINUTE },
    });
    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as StreamsResponse;
    return data.data.some((stream) => stream.type === "live");
  } catch (error) {
    console.error("Failed to fetch Twitch live status:", error);
    return false;
  }
}
