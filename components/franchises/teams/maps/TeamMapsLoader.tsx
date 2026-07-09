import { getMapsCached } from "@/lib/common/cache";
import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import {
  getTeamMapBreakdown,
  toDisplayMapName,
} from "@/lib/queries/stats/getTeamMapBreakdown";
import { ControlPanel } from "@/prisma";
import MapTileStrip from "./MapTileStrip";
import TeamMapTable, { TeamMapRow } from "./TeamMapTable";

export default async function TeamMapsLoader({
  teamId,
  season,
}: {
  teamId: number;
  season: number;
}) {
  const [breakdown, mapUuidsByName, mapPool] = await Promise.all([
    getTeamMapBreakdown(teamId, season),
    getMapsCached(),
    getMapPoolNames(),
  ]);

  if (breakdown.length === 0 && mapPool.length === 0) {
    return (
      <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
        <h2 className="text-[10px] tracking-wider uppercase font-semibold text-vdcRed mb-1">
          Maps
        </h2>
        <h3 className="text-sm text-gray-500 dark:text-gray-400 py-1">
          No map data yet
        </h3>
      </div>
    );
  }

  const withSplash = (row: Omit<TeamMapRow, "splashUrl">): TeamMapRow => {
    const mapUuid = mapUuidsByName[row.map.toUpperCase()];
    return { ...row, splashUrl: mapUuid ? MAP_LIST_URL(mapUuid) : null };
  };

  const rows = breakdown.map(withSplash);
  const seenMaps = new Set(rows.map((row) => row.map.toUpperCase()));
  const untouchedPoolRows = mapPool
    .filter((poolMap) => !seenMaps.has(poolMap.toUpperCase()))
    .map((poolMap) => withSplash(emptyBreakdownRow(poolMap)));

  const playedRows = rows.filter((row) => row.played > 0);
  const permabanRows = rows.filter(
    (row) => row.played === 0 && row.banCount > 0,
  );
  const neverPlayedRows = [
    ...rows.filter((row) => row.played === 0 && row.banCount === 0),
    ...untouchedPoolRows,
  ];

  return (
    <div className="flex flex-col gap-4">
      <TeamMapTable rows={playedRows} />
      {permabanRows.length > 0 && (
        <MapTileStrip title="Permabans" rows={permabanRows} />
      )}
      {neverPlayedRows.length > 0 && (
        <MapTileStrip title="Never Played" rows={neverPlayedRows} />
      )}
    </div>
  );
}

async function getMapPoolNames(): Promise<string[]> {
  try {
    const mapPoolValue = await ControlPanel.getMapPool();
    return mapPoolValue
      .split(",")
      .map((mapName) => mapName.trim())
      .filter((mapName) => mapName.length > 0);
  } catch {
    return [];
  }
}

function emptyBreakdownRow(mapName: string): Omit<TeamMapRow, "splashUrl"> {
  return {
    map: toDisplayMapName(mapName),
    played: 0,
    wins: 0,
    losses: 0,
    roundDiff: null,
    roundWinPercent: null,
    attackRating: null,
    defenseRating: null,
    pickCount: 0,
    banCount: 0,
    attackSideChoices: 0,
    defenseSideChoices: 0,
    agents: [],
  };
}
