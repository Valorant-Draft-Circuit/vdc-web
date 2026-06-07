import { cache } from "react";
import { Player } from "@/prisma";

export const getRiotIGNByDiscordId = cache(async (discordId: string) => {
  const riotIGN = await Player.getIGNby({ discordID: discordId });
  return riotIGN ?? null;
});
