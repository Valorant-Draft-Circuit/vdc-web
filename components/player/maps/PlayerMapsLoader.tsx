import { GameType } from "@prisma/client";
import CombineDisclaimer from "@/components/player/CombineDisclaimer";
import { getMapsCached } from "@/lib/common/cache";
import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import { selectMapCallouts, type MapRow } from "@/lib/common/maps";
import type { Maps } from "@/lib/common/valorant-api";
import { getAgentCatalog } from "@/lib/queries/agents/getAgentCatalog";
import { getPlayerMapBreakdown } from "@/lib/queries/stats/getPlayerMapBreakdown";
import MapCallouts from "./MapCallouts";
import MapCoverage from "./MapCoverage";
import MapTable from "./MapTable";
import NoMapStats from "./NoMapStats";

type Props = {
  riotIGN: string;
  season: number;
  gameType: GameType;
};

function resolveSplashUrl(maps: Maps, mapName: string): string | null {
  const uuid = maps[mapName.toUpperCase()];
  return uuid ? MAP_LIST_URL(uuid) : null;
}

export default async function PlayerMapsLoader({
  riotIGN,
  season,
  gameType,
}: Props) {
  const catalog = await getAgentCatalog();
  const [breakdown, maps] = await Promise.all([
    getPlayerMapBreakdown({ riotIgn: riotIGN, season, gameType, catalog }),
    getMapsCached(),
  ]);

  if (breakdown.length === 0) return <NoMapStats />;

  const rows: MapRow[] = breakdown.map((row) => ({
    ...row,
    splashUrl: resolveSplashUrl(maps, row.map),
  }));

  const isCombine = gameType === GameType.COMBINE;
  const callouts = selectMapCallouts(rows, isCombine ? "rating" : "winrate");

  return (
    <div className="flex flex-col gap-3">
      {isCombine && <CombineDisclaimer />}
      <MapCallouts callouts={callouts} isCombine={isCombine} />
      <MapCoverage rows={rows} isCombine={isCombine} />
      <MapTable rows={rows} isCombine={isCombine} />
    </div>
  );
}
