export type DiscordMediaResult = { image: string | null; banner: string | null };

export async function fetchFreshDiscordMedia(
  userId: string,
): Promise<DiscordMediaResult> {
  try {
    const res = await fetch("/api/discord/refresh-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      return { image: null, banner: null };
    }
    return (await res.json()) as DiscordMediaResult;
  } catch {
    return { image: null, banner: null };
  }
}
