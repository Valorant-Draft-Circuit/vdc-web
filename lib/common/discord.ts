type DiscordAssetType = "avatar" | "banner";

export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID ?? null;

export type GuildMemberMedia = { avatar: string | null; banner: string | null };

export function getMediaSource(
  asset: string | null,
  assetType: DiscordAssetType,
  id: string,
): string | null {
  const assetSize = 2048;

  if (!asset) return null;
  const format = asset.startsWith("a_") ? "gif" : "webp";
  if (assetType === "avatar") {
    return `https://cdn.discordapp.com/avatars/${id}/${asset}.${format}?size=${assetSize}`;
  }
  return `https://cdn.discordapp.com/banners/${id}/${asset}.${format}?size=${assetSize}`;
}

export function getGuildMediaSource(
  asset: string | null,
  assetType: DiscordAssetType,
  guildId: string | null,
  userId: string,
): string | null {
  const assetSize = 2048;

  if (!asset || !guildId) return null;
  const format = asset.startsWith("a_") ? "gif" : "webp";
  if (assetType === "avatar") {
    return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${asset}.${format}?size=${assetSize}`;
  }
  return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/banners/${asset}.${format}?size=${assetSize}`;
}

export async function fetchGuildMember(
  userId: string,
): Promise<GuildMemberMedia | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !DISCORD_GUILD_ID) return null;

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}`,
      { headers: { Authorization: `Bot ${botToken}` } },
    );
    if (!res.ok) return null;
    const member = await res.json();
    return { avatar: member.avatar ?? null, banner: member.banner ?? null };
  } catch (error) {
    console.error("Failed to fetch Discord guild member:", error);
    return null;
  }
}
