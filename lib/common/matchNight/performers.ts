import { NightStatRow, RecapPerformer, RecapPerformerGame } from "./types";

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

  const perGameRatings = games.map((game) => game.rating).filter(isNumber);
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

function isNumber(value: number | null): value is number {
  return value !== null;
}

function average(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function sumOf(values: Array<number | null>): number {
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}
