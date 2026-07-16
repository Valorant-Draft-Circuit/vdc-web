import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PLAYER_IDENTITY_SELECT = {
  name: true,
  PrimaryRiotAccount: { select: { riotIGN: true } },
} satisfies Prisma.UserSelect;

export type PlayerIdentity = {
  playerName: string;
  playerIgn: string | null;
};

export async function getIdentitiesByDiscordId(
  discordIds: string[],
): Promise<Map<string, PlayerIdentity>> {
  const identityByDiscordId = new Map<string, PlayerIdentity>();
  if (discordIds.length === 0) return identityByDiscordId;

  const accounts = await prisma.account.findMany({
    where: { providerAccountId: { in: discordIds } },
    select: {
      providerAccountId: true,
      User: { select: PLAYER_IDENTITY_SELECT },
    },
  });
  for (const account of accounts) {
    const ign = account.User.PrimaryRiotAccount?.riotIGN ?? null;
    identityByDiscordId.set(account.providerAccountId, {
      playerName: ign ?? account.User.name ?? account.providerAccountId,
      playerIgn: ign,
    });
  }
  return identityByDiscordId;
}

export function identityFor(
  identities: Map<string, PlayerIdentity>,
  discordID: string,
): PlayerIdentity {
  return (
    identities.get(discordID) ?? { playerName: discordID, playerIgn: null }
  );
}
