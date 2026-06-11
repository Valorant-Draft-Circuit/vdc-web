import { Tier } from "@prisma/client";
import { TeamStats } from "../queries/standings/standings";

export type RecapViewKey = Tier | "OVERALL";
export type RecapStat = "rating" | "acs" | "kd";

export type NightStatRow = {
  userID: string;
  playerName: string;
  tier: Tier;
  gameID: string;
  map: string | null;
  matchID: number | null;
  homeTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamName: string | null;
  awayTeamLogo: string | null;
  ratingAttack: number | null;
  ratingDefense: number | null;
  acs: number | null;
  kills: number | null;
  deaths: number | null;
};

export type RecapPerformerGame = {
  gameID: string;
  map: string | null;
  matchID: number | null;
  homeTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamName: string | null;
  awayTeamLogo: string | null;
  rating: number | null;
  acs: number;
  kd: number;
};

export type RecapPerformer = {
  playerName: string;
  tier: Tier;
  gamesPlayed: number;
  games: RecapPerformerGame[];
  rating: number | null;
  acs: number;
  kd: number;
};

export type RecapMapGame = {
  tier: Tier;
  matchID: number | null;
  gameID: string | null;
  homeTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamName: string | null;
  awayTeamLogo: string | null;
};

export type RecapMapEntry = {
  map: string | null;
  game: RecapMapGame;
};

export type RecapMapCount = {
  map: string;
  count: number;
  share: number;
  games: RecapMapGame[];
};

export type RecapMapReport = {
  mostPlayed: RecapMapCount | null;
  mostBanned: RecapMapCount | null;
};

export type RecapMover = {
  teamName: string;
  franchiseSlug: string;
  teamLogo: string | null;
  tier: Tier;
  previousRank: number;
  currentRank: number;
  delta: number;
};

export type RecapView = {
  key: RecapViewKey;
  matchDay: number | null;
  nightDate: Date | null;
  performers: RecapPerformer[];
  mapReport: RecapMapReport;
  movers: RecapMover[];
};

export function buildTopPerformers(rows: NightStatRow[]): RecapPerformer[] {
  const rowsByPlayer = new Map<string, NightStatRow[]>();
  for (const row of rows) {
    const playerRows = rowsByPlayer.get(row.userID) ?? [];
    playerRows.push(row);
    rowsByPlayer.set(row.userID, playerRows);
  }

  const performers: RecapPerformer[] = [];
  for (const playerRows of rowsByPlayer.values()) {
    performers.push(summarizePlayerNight(playerRows));
  }
  return performers;
}

function summarizePlayerNight(playerRows: NightStatRow[]): RecapPerformer {
  const games = playerRows.map(summarizePlayerGame);

  const perGameRatings = games
    .map((game) => game.rating)
    .filter(isNumber);
  const acsValues = playerRows.map((row) => row.acs).filter(isNumber);
  const kills = sumOf(playerRows.map((row) => row.kills));
  const deaths = sumOf(playerRows.map((row) => row.deaths));

  return {
    playerName: playerRows[0].playerName,
    tier: playerRows[0].tier,
    gamesPlayed: playerRows.length,
    games,
    rating: perGameRatings.length > 0 ? average(perGameRatings) : null,
    acs: acsValues.length > 0 ? average(acsValues) : 0,
    kd: deaths === 0 ? kills : kills / deaths,
  };
}

function summarizePlayerGame(row: NightStatRow): RecapPerformerGame {
  const sideRatings = [row.ratingAttack, row.ratingDefense].filter(isNumber);
  const kills = row.kills ?? 0;
  const deaths = row.deaths ?? 0;

  return {
    gameID: row.gameID,
    map: row.map,
    matchID: row.matchID,
    homeTeamName: row.homeTeamName,
    homeTeamLogo: row.homeTeamLogo,
    awayTeamName: row.awayTeamName,
    awayTeamLogo: row.awayTeamLogo,
    rating: sideRatings.length > 0 ? average(sideRatings) : null,
    acs: row.acs ?? 0,
    kd: deaths === 0 ? kills : kills / deaths,
  };
}

export function buildMapReport(
  playedMaps: RecapMapEntry[],
  bannedMaps: RecapMapEntry[]
): RecapMapReport {
  return {
    mostPlayed: mostFrequentMap(playedMaps),
    mostBanned: mostFrequentMap(bannedMaps),
  };
}

type MapTally = {
  count: number;
  gamesByKey: Map<string, RecapMapGame>;
};

function mostFrequentMap(entries: RecapMapEntry[]): RecapMapCount | null {
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
      entry.game
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
    share: best.tally.count / totalCount,
    games: [...best.tally.gamesByKey.values()],
  };
}

export function buildStandingsMovers(
  rankedBefore: TeamStats[],
  rankedAfter: TeamStats[],
  tier: Tier
): RecapMover[] {
  const beforeRankByTeamId = new Map<number, number>();
  rankedBefore.forEach((team, rank) => beforeRankByTeamId.set(team.id, rank));

  const movers: RecapMover[] = [];
  rankedAfter.forEach((team, afterRank) => {
    const beforeRank = beforeRankByTeamId.get(team.id);
    if (beforeRank === undefined) return;

    const delta = beforeRank - afterRank;
    if (delta === 0) return;

    movers.push({
      teamName: team.name,
      franchiseSlug: team.Franchise.slug,
      teamLogo: team.Franchise.Brand?.logo ?? null,
      tier,
      previousRank: beforeRank + 1,
      currentRank: afterRank + 1,
      delta,
    });
  });

  return sortMovers(movers);
}

export function sortMovers(movers: RecapMover[]): RecapMover[] {
  return [...movers].sort((left, right) => {
    const byMagnitude = Math.abs(right.delta) - Math.abs(left.delta);
    if (byMagnitude !== 0) return byMagnitude;
    if (right.delta !== left.delta) return right.delta - left.delta;
    return left.teamName.localeCompare(right.teamName);
  });
}

function isNumber(value: number | null): value is number {
  return value !== null;
}

function average(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function sumOf(values: Array<number | null>): number {
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}
