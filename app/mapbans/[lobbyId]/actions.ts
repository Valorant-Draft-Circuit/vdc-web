"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { MapBansSide } from "@prisma/client";
import { deriveVetoState } from "@/lib/common/mapbansFlow";
import {
  applyMapPick,
  applySidePick,
  getLobby,
} from "@/lib/server/mapbanLobbies";
import { emitMapbanChanged, emitMapbanPreview } from "@/lib/server/mapbanEvents";

type ActionResult = { ok: true } | { ok: false; error: string };

const ACTION_ERROR_MESSAGES: Record<string, string> = {
  LOBBY_NOT_FOUND: "Lobby expired or not found",
  NOT_MAP_TURN: "It is not a map turn",
  NOT_SIDE_TURN: "It is not a side turn",
  SIDE_NOT_CURRENT: "That side turn is not current - refreshing",
  NOT_YOUR_TURN: "It is not your team's turn",
  MAP_NOT_AVAILABLE: "That map is not in the remaining pool",
  LOBBY_ROW_MISSING: "Lobby state error - refreshing",
};

function toMessage(error: unknown): string {
  const key = error instanceof Error ? error.message : "";
  return ACTION_ERROR_MESSAGES[key] ?? "Something went wrong";
}

async function resolveActorTeam(
  lobbyId: string,
): Promise<{ error: string } | { viewerTeamId: number }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not logged in" };
  const lobby = getLobby(lobbyId);
  if (!lobby) return { error: "Lobby expired or not found" };
  const viewer = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      team: { in: [lobby.homeTeamId, lobby.awayTeamId] },
    },
    select: { team: true },
  });
  if (!viewer?.team) return { error: "You are not rostered on either team" };
  return { viewerTeamId: viewer.team };
}

export async function previewMapbanSelection(
  lobbyId: string,
  map: string | null,
): Promise<ActionResult> {
  const ctx = await resolveActorTeam(lobbyId);
  if ("error" in ctx) return { ok: false, error: ctx.error };

  let normalizedPreview: string | null = null;
  if (map !== null) {
    const lobby = getLobby(lobbyId);
    if (!lobby) return { ok: false, error: "Lobby expired or not found" };
    const state = deriveVetoState(lobby.rows, lobby.mapPool);
    if (state.phase !== "map-turns" || !state.currentMapTurn) {
      return { ok: false, error: "It is not a map turn" };
    }
    if (state.currentMapTurn.actingTeamId !== ctx.viewerTeamId) {
      return { ok: false, error: "It is not your team's turn" };
    }
    normalizedPreview =
      state.remainingMaps.find(
        (candidate) => candidate.toUpperCase() === map.toUpperCase(),
      ) ?? null;
    if (!normalizedPreview) {
      return { ok: false, error: "That map is not in the remaining pool" };
    }
  }

  emitMapbanPreview(lobbyId, normalizedPreview);
  return { ok: true };
}

export async function submitMapbanPick(
  lobbyId: string,
  map: string,
): Promise<ActionResult> {
  const ctx = await resolveActorTeam(lobbyId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  try {
    applyMapPick(lobbyId, ctx.viewerTeamId, map);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
  emitMapbanPreview(lobbyId, null);
  emitMapbanChanged(lobbyId);
  revalidatePath(`/mapbans/${lobbyId}`);
  return { ok: true };
}

export async function submitMapbanSide(
  lobbyId: string,
  rowId: number,
  side: MapBansSide,
): Promise<ActionResult> {
  const ctx = await resolveActorTeam(lobbyId);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  try {
    applySidePick(lobbyId, ctx.viewerTeamId, rowId, side);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
  emitMapbanChanged(lobbyId);
  revalidatePath(`/mapbans/${lobbyId}`);
  return { ok: true };
}
