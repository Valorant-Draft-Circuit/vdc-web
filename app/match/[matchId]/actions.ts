"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { ControlPanel, Roles } from "@/prisma";
import { MapBansSide, MatchType, VetoSource } from "@prisma/client";
import { buildVetoSkeleton, deriveVetoState } from "@/lib/common/mapbansFlow";
import { emitVetoChanged } from "@/lib/server/vetoEvents";
import { getWebMapbansFlags } from "@/lib/queries/control/control";
import { getDiscordIdByUserId } from "@/lib/queries/user/user";

const VETO_START_WINDOW_MS = 12 * 60 * 60 * 1000;
const VETO_MATCH_TYPES: MatchType[] = [
  MatchType.BO2,
  MatchType.BO3,
  MatchType.BO5,
];
const VETO_STAFF_ROLES = [Roles.ADMIN, Roles.LEAD_TECH];

type ActionResult =
  | { ok: true }
  | { ok: false; error: string; vetoUrl?: string };

type RosteredViewerContext = {
  match: {
    matchID: number;
    matchType: MatchType;
    dateScheduled: Date;
    home: number | null;
    away: number | null;
  };
  viewerTeamId: number;
  userId: string;
};

async function requireRosteredViewer(
  matchID: number,
): Promise<{ error: string } | RosteredViewerContext> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not logged in" as const };
  const match = await prisma.matches.findFirst({
    where: { matchID },
    select: {
      matchID: true,
      matchType: true,
      dateScheduled: true,
      home: true,
      away: true,
    },
  });
  if (!match || match.home === null || match.away === null)
    return { error: "Match not found" as const };
  if (!VETO_MATCH_TYPES.includes(match.matchType))
    return { error: "This match type has no veto" as const };
  const viewer = await prisma.user.findFirst({
    where: { id: session.user.id, team: { in: [match.home, match.away] } },
    select: { team: true },
  });
  if (!viewer?.team)
    return { error: "You are not rostered on either team" as const };
  return { match, viewerTeamId: viewer.team, userId: session.user.id };
}

async function requireVetoActor(
  matchID: number,
): Promise<{ error: string } | RosteredViewerContext> {
  const flags = await getWebMapbansFlags();
  if (!flags.enabled) return { error: "Web map bans are not enabled" as const };
  const ctx = await requireRosteredViewer(matchID);
  if ("error" in ctx) return ctx;
  if (flags.staffOnly) {
    const [roles, discordId] = await Promise.all([
      getUserRoles(ctx.userId),
      getDiscordIdByUserId(ctx.userId),
    ]);
    const isAllowlisted =
      discordId !== null && flags.allowlist.includes(discordId);
    if (!hasAccess(roles, VETO_STAFF_ROLES) && !isAllowlisted)
      return { error: "Web map bans are in staff testing" as const };
  }
  return ctx;
}

function revalidateMatch(matchID: number) {
  revalidatePath(`/match/${matchID}`);
}

export async function startVeto(matchID: number): Promise<ActionResult> {
  const ctx = await requireVetoActor(matchID);
  if ("error" in ctx) return { ok: false, error: ctx.error };
  const { match } = ctx;

  if (match.dateScheduled.getTime() - Date.now() > VETO_START_WINDOW_MS) {
    return {
      ok: false,
      error: "Map bans cannot begin more than 12 hours before the match",
    };
  }

  const [banOrderStr, mapPoolStr] = await Promise.all([
    ControlPanel.getBanOrder(match.matchType),
    ControlPanel.getMapPool(),
  ]);
  const banOrder = banOrderStr.split(",");
  const mapPool = mapPoolStr.split(",");
  if (banOrder.length === 0 || mapPool.length < banOrder.length) {
    return { ok: false, error: "Ban order or map pool is misconfigured" };
  }

  const vetoUrl = `https://vdc.gg/match/${matchID}`;
  const skeleton = buildVetoSkeleton(
    matchID,
    banOrder,
    match.home as number,
    match.away as number,
    vetoUrl,
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT matchID FROM Matches WHERE matchID = ${matchID} FOR UPDATE`;
      const existing = await tx.mapBans.count({ where: { matchID } });
      if (existing > 0) throw new Error("VETO_EXISTS");
      await tx.mapBans.createMany({ data: skeleton });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "VETO_EXISTS") {
      const existingUrl = (
        await prisma.mapBans.findFirst({
          where: { matchID, vetoUrl: { not: null } },
          select: { vetoUrl: true },
        })
      )?.vetoUrl;
      return {
        ok: false,
        error: "A veto for this match is already in progress",
        vetoUrl: existingUrl ?? undefined,
      };
    }
    throw error;
  }

  emitVetoChanged(matchID);
  revalidateMatch(matchID);
  return { ok: true };
}

export async function submitMapPick(
  matchID: number,
  map: string,
): Promise<ActionResult> {
  const ctx = await requireVetoActor(matchID);
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const [rows, mapPoolStr] = await Promise.all([
    prisma.mapBans.findMany({ where: { matchID }, orderBy: { order: "asc" } }),
    ControlPanel.getMapPool(),
  ]);
  if (!rows.some((row) => row.source === VetoSource.WEB)) {
    return { ok: false, error: "This veto is not running on the website" };
  }

  const state = deriveVetoState(rows, mapPoolStr.split(","));
  if (state.phase !== "map-turns" || !state.currentMapTurn) {
    return { ok: false, error: "It is not a map turn" };
  }
  if (state.currentMapTurn.actingTeamId !== ctx.viewerTeamId) {
    return { ok: false, error: "It is not your team's turn" };
  }
  const normalizedPick = state.remainingMaps.find(
    (candidate) => candidate.toUpperCase() === map.toUpperCase(),
  );
  if (!normalizedPick) {
    return { ok: false, error: "That map is not in the remaining pool" };
  }

  const updated = await prisma.mapBans.updateMany({
    where: { id: state.currentMapTurn.rowId, map: null },
    data: { map: normalizedPick },
  });
  if (updated.count === 0) {
    return { ok: false, error: "That turn was already taken - refreshing" };
  }

  const refreshedRows = await prisma.mapBans.findMany({
    where: { matchID },
    orderBy: { order: "asc" },
  });
  const refreshedState = deriveVetoState(refreshedRows, mapPoolStr.split(","));
  for (const autoFill of refreshedState.autoFillRows) {
    await prisma.mapBans.updateMany({
      where: { id: autoFill.rowId, map: null },
      data: { map: autoFill.map },
    });
  }

  emitVetoChanged(matchID);
  revalidateMatch(matchID);
  return { ok: true };
}

export async function submitSidePick(
  matchID: number,
  rowId: number,
  side: MapBansSide,
): Promise<ActionResult> {
  const ctx = await requireVetoActor(matchID);
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const [rows, mapPoolStr] = await Promise.all([
    prisma.mapBans.findMany({ where: { matchID }, orderBy: { order: "asc" } }),
    ControlPanel.getMapPool(),
  ]);
  if (!rows.some((row) => row.source === VetoSource.WEB)) {
    return { ok: false, error: "This veto is not running on the website" };
  }

  const state = deriveVetoState(rows, mapPoolStr.split(","));
  if (state.phase !== "side-turns" || !state.currentSideTurn) {
    return { ok: false, error: "It is not a side turn" };
  }
  if (state.currentSideTurn.rowId !== rowId) {
    return { ok: false, error: "That side turn is not current - refreshing" };
  }
  if (state.currentSideTurn.actingTeamId !== ctx.viewerTeamId) {
    return { ok: false, error: "It is not your team's side pick" };
  }

  const updated = await prisma.mapBans.updateMany({
    where: { id: rowId, side: null },
    data: { side },
  });
  if (updated.count === 0) {
    return { ok: false, error: "That side was already picked - refreshing" };
  }

  emitVetoChanged(matchID);
  revalidateMatch(matchID);
  return { ok: true };
}

export async function resetVeto(matchID: number): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not logged in" };

  const roles = await getUserRoles(session.user.id);
  if (!hasAccess(roles, VETO_STAFF_ROLES)) {
    return { ok: false, error: "Unauthorized" };
  }

  await prisma.mapBans.deleteMany({ where: { matchID } });

  emitVetoChanged(matchID);
  revalidateMatch(matchID);
  return { ok: true };
}
