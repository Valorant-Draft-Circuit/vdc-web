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
    mostPlayed: mostFrequentMap(playedMaps),
    mostBanned: mostFrequentMap(bannedMaps, matchCount),
  };
}

type MapTally = {
  count: number;
  gamesByKey: Map<string, RecapMapGame>;
};

function mostFrequentMap(
  entries: RecapMapEntry[],
  shareDenominator?: number,
): RecapMapCount | null {
  const tallyByMap = new Map<string, MapTally>();
  let totalCount = 0;
  for (const entry of entries) {
    if (!entry.map) continue;

    const tally = tallyByMap.get(entry.map) ?? {
      count: 0,
      gamesByKey: new Map(),
    };
    tally.count += 1;
    totalCount += 1;
    tally.gamesByKey.set(
      `${entry.game.matchID}-${entry.game.gameID}`,
      entry.game,
    );
    tallyByMap.set(entry.map, tally);
  }

  let best: { map: string; tally: MapTally } | null = null;
  for (const [map, tally] of tallyByMap) {
    const beatsBest =
      best === null ||
      tally.count > best.tally.count ||
      (tally.count === best.tally.count && map.localeCompare(best.map) < 0);
    if (beatsBest) {
      best = { map, tally };
    }
  }
  if (best === null) return null;

  return {
    map: best.map,
    count: best.tally.count,
    share: best.tally.count / (shareDenominator ?? totalCount),
    games: [...best.tally.gamesByKey.values()],
  };
}
