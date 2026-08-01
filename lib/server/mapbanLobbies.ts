import { randomUUID } from "crypto";
import { MapBansSide } from "@prisma/client";
import {
  buildSkeletonRows,
  deriveVetoState,
  VetoRow,
} from "../common/mapbansFlow";
import {
  MapBanLobbyFormat,
  MAPBAN_LOBBY_BAN_ORDERS,
  MAPBAN_LOBBY_COMPLETE_GRACE_MS,
  MAPBAN_LOBBY_GLOBAL_CAP,
  MAPBAN_LOBBY_IDLE_MS,
  MAPBAN_LOBBY_MAX_AGE_MS,
  MAPBAN_LOBBY_PER_USER_CAP,
} from "../common/mapbanLobbyConfig";

export type MapBanLobby = {
  id: string;
  homeTeamId: number;
  awayTeamId: number;
  format: MapBanLobbyFormat;
  mapPool: string[];
  banOrder: string[];
  rows: VetoRow[];
  createdBy: string;
  createdAt: number;
  lastActivityAt: number;
  status: "active" | "complete";
};

const STORE_KEY = "__vdcMapbanLobbies";

type GlobalWithStore = typeof globalThis & {
  [STORE_KEY]?: Map<string, MapBanLobby>;
};

export function mapbanLobbies(): Map<string, MapBanLobby> {
  const scope = globalThis as GlobalWithStore;
  if (!scope[STORE_KEY]) scope[STORE_KEY] = new Map();
  return scope[STORE_KEY];
}

export function getLobby(id: string): MapBanLobby | null {
  return mapbanLobbies().get(id) ?? null;
}

function refreshStatus(lobby: MapBanLobby) {
  lobby.status =
    deriveVetoState(lobby.rows, lobby.mapPool).phase === "complete"
      ? "complete"
      : "active";
}

export function createLobby(input: {
  homeTeamId: number;
  awayTeamId: number;
  format: MapBanLobbyFormat;
  mapPool: string[];
  createdBy: string;
}): MapBanLobby {
  const store = mapbanLobbies();
  if (store.size >= MAPBAN_LOBBY_GLOBAL_CAP) {
    throw new Error("MAPBAN_LOBBY_GLOBAL_CAP");
  }
  const activeForUser = [...store.values()].filter(
    (lobby) => lobby.createdBy === input.createdBy,
  ).length;
  if (activeForUser >= MAPBAN_LOBBY_PER_USER_CAP) {
    throw new Error("MAPBAN_LOBBY_PER_USER_CAP");
  }
  const banOrder = MAPBAN_LOBBY_BAN_ORDERS[input.format];
  if (input.mapPool.length !== banOrder.length) {
    throw new Error("MAPBAN_LOBBY_POOL_MISMATCH");
  }
  const rows: VetoRow[] = buildSkeletonRows(
    banOrder,
    input.homeTeamId,
    input.awayTeamId,
  ).map((row) => ({
    id: row.order,
    order: row.order,
    type: row.type,
    team: row.team,
    map: null,
    side: null,
  }));

  const now = Date.now();
  const lobby: MapBanLobby = {
    id: randomUUID(),
    homeTeamId: input.homeTeamId,
    awayTeamId: input.awayTeamId,
    format: input.format,
    mapPool: input.mapPool,
    banOrder,
    rows,
    createdBy: input.createdBy,
    createdAt: now,
    lastActivityAt: now,
    status: "active",
  };
  store.set(lobby.id, lobby);
  return lobby;
}

export function applyMapPick(
  id: string,
  actorTeamId: number,
  map: string,
): MapBanLobby {
  const lobby = getLobby(id);
  if (!lobby) throw new Error("LOBBY_NOT_FOUND");

  const state = deriveVetoState(lobby.rows, lobby.mapPool);
  if (state.phase !== "map-turns" || !state.currentMapTurn) {
    throw new Error("NOT_MAP_TURN");
  }
  if (state.currentMapTurn.actingTeamId !== actorTeamId) {
    throw new Error("NOT_YOUR_TURN");
  }
  const normalized = state.remainingMaps.find(
    (candidate) => candidate.toUpperCase() === map.toUpperCase(),
  );
  if (!normalized) throw new Error("MAP_NOT_AVAILABLE");

  const turnRow = lobby.rows.find((row) => row.id === state.currentMapTurn!.rowId);
  if (!turnRow) throw new Error("LOBBY_ROW_MISSING");
  turnRow.map = normalized;

  const refreshed = deriveVetoState(lobby.rows, lobby.mapPool);
  for (const autoFill of refreshed.autoFillRows) {
    const row = lobby.rows.find((candidate) => candidate.id === autoFill.rowId);
    if (row) row.map = autoFill.map;
  }

  lobby.lastActivityAt = Date.now();
  refreshStatus(lobby);
  return lobby;
}

export function applySidePick(
  id: string,
  actorTeamId: number,
  rowId: number,
  side: MapBansSide,
): MapBanLobby {
  const lobby = getLobby(id);
  if (!lobby) throw new Error("LOBBY_NOT_FOUND");

  const state = deriveVetoState(lobby.rows, lobby.mapPool);
  if (state.phase !== "side-turns" || !state.currentSideTurn) {
    throw new Error("NOT_SIDE_TURN");
  }
  if (state.currentSideTurn.rowId !== rowId) {
    throw new Error("SIDE_NOT_CURRENT");
  }
  if (state.currentSideTurn.actingTeamId !== actorTeamId) {
    throw new Error("NOT_YOUR_TURN");
  }

  const row = lobby.rows.find((candidate) => candidate.id === rowId);
  if (!row) throw new Error("LOBBY_ROW_MISSING");
  row.side = side;

  lobby.lastActivityAt = Date.now();
  refreshStatus(lobby);
  return lobby;
}

export function touchLobby(id: string) {
  const lobby = getLobby(id);
  if (lobby) lobby.lastActivityAt = Date.now();
}

export function shouldEvict(
  lobby: MapBanLobby,
  now: number,
  hasSockets: boolean,
): boolean {
  if (now - lobby.createdAt > MAPBAN_LOBBY_MAX_AGE_MS) return true;
  if (
    lobby.status === "complete" &&
    now - lobby.lastActivityAt > MAPBAN_LOBBY_COMPLETE_GRACE_MS
  ) {
    return true;
  }
  if (!hasSockets && now - lobby.lastActivityAt > MAPBAN_LOBBY_IDLE_MS) {
    return true;
  }
  return false;
}
