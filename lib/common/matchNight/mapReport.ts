import {
  RecapMapCount,
  RecapMapEntry,
  RecapMapGame,
  RecapMapReport,
} from "./types";

export function buildMapReport(
  playedMaps: RecapMapEntry[],
  bannedMaps: RecapMapEntry[],
  matchCount: number,
): RecapMapReport {
  return {
    mostPlayed: pickExtremeMap(tallyMaps(playedMaps), "most"),
    mostBanned: pickExtremeMap(tallyMaps(bannedMaps, matchCount), "most"),
  };
}

export function buildSeasonMapReport(
  playedMaps: RecapMapEntry[],
  bannedMaps: RecapMapEntry[],
  matchCount: number,
): RecapMapReport {
  const playedTallies = tallyMaps(playedMaps);
  const bannedTallies = tallyMaps(bannedMaps, matchCount);
  return {
    mostPlayed: pickExtremeMap(playedTallies, "most"),
    leastPlayed: pickExtremeMap(playedTallies, "least"),
    mostBanned: pickExtremeMap(bannedTallies, "most"),
    leastBanned: pickExtremeMap(bannedTallies, "least"),
  };
}

type MapTally = {
  count: number;
  gamesByKey: Map<string, RecapMapGame>;
};

type MapTallies = {
  byMap: Map<string, MapTally>;
  shareDenominator: number;
};

function tallyMaps(
  entries: RecapMapEntry[],
  shareDenominator?: number,
): MapTallies {
  const byMap = new Map<string, MapTally>();
  let totalCount = 0;
  for (const entry of entries) {
    if (!entry.map) continue;

    const tally = byMap.get(entry.map) ?? {
      count: 0,
      gamesByKey: new Map(),
    };
    tally.count += 1;
    totalCount += 1;
    tally.gamesByKey.set(
      `${entry.game.matchID}-${entry.game.gameID}`,
      entry.game,
    );
    byMap.set(entry.map, tally);
  }

  return { byMap, shareDenominator: shareDenominator ?? totalCount };
}

function pickExtremeMap(
  tallies: MapTallies,
  extreme: "most" | "least",
): RecapMapCount | null {
  if (tallies.byMap.size === 0) return null;
  // A "least" map is only meaningful once more than one map has appeared,
  // otherwise it would name the same map already shown as "most".
  if (extreme === "least" && tallies.byMap.size < 2) return null;

  let chosen: { map: string; tally: MapTally } | null = null;
  for (const [map, tally] of tallies.byMap) {
    if (chosen === null || beatsChosen(map, tally, chosen, extreme)) {
      chosen = { map, tally };
    }
  }
  if (chosen === null) return null;

  return {
    map: chosen.map,
    count: chosen.tally.count,
    share: chosen.tally.count / tallies.shareDenominator,
    games: [...chosen.tally.gamesByKey.values()],
  };
}

function beatsChosen(
  map: string,
  tally: MapTally,
  chosen: { map: string; tally: MapTally },
  extreme: "most" | "least",
): boolean {
  const isMoreExtremeCount =
    extreme === "most"
      ? tally.count > chosen.tally.count
      : tally.count < chosen.tally.count;
  if (isMoreExtremeCount) return true;

  if (tally.count !== chosen.tally.count) return false;
  // On ties, "most" keeps the alphabetically first map and "least" keeps the
  // alphabetically last, so the two extremes never resolve to the same map.
  return extreme === "most"
    ? map.localeCompare(chosen.map) < 0
    : map.localeCompare(chosen.map) > 0;
}
