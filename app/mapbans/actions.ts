"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { createLobby } from "@/lib/server/mapbanLobbies";
import {
  MAPBAN_LOBBY_FORMATS,
  MapBanLobbyFormat,
} from "@/lib/common/mapbanLobbyConfig";

type CreateResult =
  | { ok: true; lobbyId: string }
  | { ok: false; error: string };

const CREATE_ERROR_MESSAGES: Record<string, string> = {
  MAPBAN_LOBBY_GLOBAL_CAP: "Too many active lobbies right now, try again shortly",
  MAPBAN_LOBBY_PER_USER_CAP: "You already have the maximum number of open lobbies",
  MAPBAN_LOBBY_POOL_MISMATCH: "The map pool size does not match this format",
};

export async function createMapbanLobby(input: {
  homeTeamId: number;
  awayTeamId: number;
  format: MapBanLobbyFormat;
}): Promise<CreateResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not logged in" };
  if (input.homeTeamId === input.awayTeamId) {
    return { ok: false, error: "Home and away teams must be different" };
  }
  if (!MAPBAN_LOBBY_FORMATS.includes(input.format)) {
    return { ok: false, error: "Invalid format" };
  }

  const teams = await prisma.teams.findMany({
    where: { id: { in: [input.homeTeamId, input.awayTeamId] } },
    select: { id: true },
  });
  if (teams.length !== 2) return { ok: false, error: "Team not found" };

  const mapPool = (await ControlPanel.getMapPool()).split(",");

  try {
    const lobby = createLobby({
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      format: input.format,
      mapPool,
      createdBy: session.user.id,
    });
    return { ok: true, lobbyId: lobby.id };
  } catch (error) {
    const key = error instanceof Error ? error.message : "";
    return {
      ok: false,
      error: CREATE_ERROR_MESSAGES[key] ?? "Could not create lobby",
    };
  }
}
