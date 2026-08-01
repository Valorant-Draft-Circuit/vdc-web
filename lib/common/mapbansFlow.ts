import { MapBansSide, MapBanType } from "@prisma/client";

export type VetoRow = {
  id: number;
  order: number;
  type: MapBanType;
  team: number | null;
  map: string | null;
  side: MapBansSide | null;
};

export type VetoPhase = "not-started" | "map-turns" | "side-turns" | "complete";

export type VetoMapTurn = {
  rowId: number;
  order: number;
  type: typeof MapBanType.BAN | typeof MapBanType.PICK;
  actingTeamId: number;
};

export type VetoSideTurn = {
  rowId: number;
  order: number;
  map: string;
  actingTeamId: number;
};

export type VetoState = {
  phase: VetoPhase;
  rows: VetoRow[];
  remainingMaps: string[];
  currentMapTurn: VetoMapTurn | null;
  currentSideTurn: VetoSideTurn | null;
  autoFillRows: { rowId: number; map: string }[];
};

export function parseBanOrderToken(token: string): {
  type: MapBanType;
  isHome: boolean | null;
} {
  const upper = token.toUpperCase();
  let type: MapBanType;
  if (upper.includes("PICK")) type = MapBanType.PICK;
  else if (upper.includes("BAN")) type = MapBanType.BAN;
  else if (upper.includes("DISCARD")) type = MapBanType.DISCARD;
  else if (upper.includes("DECIDER")) type = MapBanType.DECIDER;
  else throw new Error(`Unknown ban order token: ${token}`);
  const isHome = upper.includes("HOME")
    ? true
    : upper.includes("AWAY")
      ? false
      : null;
  return { type, isHome };
}

export function buildSkeletonRows(
  banOrder: string[],
  homeTeamId: number,
  awayTeamId: number,
): { order: number; type: MapBanType; team: number | null }[] {
  return banOrder.map((token, index) => {
    const { type, isHome } = parseBanOrderToken(token);
    const isDefault =
      type === MapBanType.DISCARD || type === MapBanType.DECIDER;
    return {
      order: index,
      type,
      team: isDefault ? null : isHome ? homeTeamId : awayTeamId,
    };
  });
}

export function buildVetoSkeleton(
  matchID: number,
  banOrder: string[],
  homeTeamId: number,
  awayTeamId: number,
  vetoUrl: string,
) {
  return buildSkeletonRows(banOrder, homeTeamId, awayTeamId).map((row) => ({
    matchID,
    order: row.order,
    type: row.type,
    team: row.team,
    source: "WEB" as const,
    vetoUrl,
  }));
}

export function deriveVetoState(
  rowsInput: VetoRow[],
  mapPool: string[],
): VetoState {
  const rows = [...rowsInput].sort((a, b) => a.order - b.order);
  if (rows.length === 0) {
    return {
      phase: "not-started",
      rows,
      remainingMaps: mapPool,
      currentMapTurn: null,
      currentSideTurn: null,
      autoFillRows: [],
    };
  }

  const pickedMaps = rows
    .map((row) => row.map)
    .filter((map): map is string => map !== null)
    .map((map) => map.toUpperCase());
  const remainingMaps = mapPool.filter(
    (map) => !pickedMaps.includes(map.toUpperCase()),
  );

  const nextActionableMapRow = rows.find(
    (
      row,
    ): row is VetoRow & {
      type: typeof MapBanType.BAN | typeof MapBanType.PICK;
    } =>
      row.map === null &&
      (row.type === MapBanType.BAN || row.type === MapBanType.PICK),
  );

  if (nextActionableMapRow) {
    if (nextActionableMapRow.team === null) {
      throw new Error(
        `Veto row ${nextActionableMapRow.id} is a BAN/PICK with no team`,
      );
    }
    return {
      phase: "map-turns",
      rows,
      remainingMaps,
      currentMapTurn: {
        rowId: nextActionableMapRow.id,
        order: nextActionableMapRow.order,
        type: nextActionableMapRow.type,
        actingTeamId: nextActionableMapRow.team,
      },
      currentSideTurn: null,
      autoFillRows: [],
    };
  }

  const unfilledDefaultRows = rows.filter((row) => row.map === null);
  if (unfilledDefaultRows.length > 0) {
    const autoFillRows = unfilledDefaultRows.map((row, index) => ({
      rowId: row.id,
      map: remainingMaps[index],
    }));
    return {
      phase: "map-turns",
      rows,
      remainingMaps,
      currentMapTurn: null,
      currentSideTurn: null,
      autoFillRows,
    };
  }

  const sideRows = rows.filter(
    (row) => row.type === MapBanType.PICK || row.type === MapBanType.DECIDER,
  );
  const nextSideRow = sideRows.find((row) => row.side === null);
  if (nextSideRow) {
    return {
      phase: "side-turns",
      rows,
      remainingMaps,
      currentMapTurn: null,
      currentSideTurn: {
        rowId: nextSideRow.id,
        order: nextSideRow.order,
        map: nextSideRow.map as string,
        actingTeamId: sideChooserFor(nextSideRow, rows),
      },
      autoFillRows: [],
    };
  }

  return {
    phase: "complete",
    rows,
    remainingMaps,
    currentMapTurn: null,
    currentSideTurn: null,
    autoFillRows: [],
  };
}

export function sideChooserFor(sideRow: VetoRow, allRows: VetoRow[]): number {
  const distinctTeamsInRowOrder = Array.from(
    new Set(allRows.map((row) => row.team)),
  );
  const chooser = distinctTeamsInRowOrder.find(
    (teamId) => teamId !== null && teamId !== sideRow.team,
  );
  if (chooser === undefined || chooser === null) {
    throw new Error(`Cannot resolve side chooser for veto row ${sideRow.id}`);
  }
  return chooser;
}
