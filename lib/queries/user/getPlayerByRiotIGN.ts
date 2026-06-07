import { cache } from "react";
import { Player } from "@/prisma";

export const getPlayerByRiotIGN = cache(async (riotIGN: string) => {
  const player = await Player.getBy({ ign: riotIGN });
  return player ?? null;
});
