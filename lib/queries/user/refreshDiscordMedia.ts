import { prisma } from "@/lib/prisma";
import { getMediaSource } from "@/lib/common/discord";
import { updatePlayerDocument } from "@/lib/meilisearch/updatePlayerDocument";

export type DiscordMedia = { image: string | null; banner: string | null };

type DiscordUserResponse = {
  avatar: string | null;
  banner: string | null;
};

export async function refreshDiscordMedia(userId: string): Promise<DiscordMedia> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      image: true,
      banner: true,
      Accounts: {
        where: { provider: "discord" },
        select: { providerAccountId: true },
      },
    },
  });
  if (!user) {
    return { image: null, banner: null };
  }

  const stored: DiscordMedia = { image: user.image, banner: user.banner };

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const discordId = user.Accounts[0]?.providerAccountId;
  if (!botToken || !discordId) {
    return stored;
  }

  let fresh: DiscordUserResponse;
  try {
    const res = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
      headers: { Authorization: `Bot ${botToken}` },
    });
    if (!res.ok) {
      return stored;
    }
    fresh = (await res.json()) as DiscordUserResponse;
  } catch (error) {
    console.error("Failed to fetch Discord user:", error);
    return stored;
  }

  const image = getMediaSource(fresh.avatar ?? null, "avatar", discordId);
  const banner = getMediaSource(fresh.banner ?? null, "banner", discordId);

  const changes: { image?: string | null; banner?: string | null } = {};
  if (image !== user.image) {
    changes.image = image;
  }
  if (banner !== user.banner) {
    changes.banner = banner;
  }

  if (Object.keys(changes).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: changes });
    await updatePlayerDocument(userId);
  }

  return { image, banner };
}
