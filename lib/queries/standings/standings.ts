import { cache } from "react";
import { GameType, MatchType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Tier } from "@prisma/client";
import {
  getAllActiveTeamsIn,
  getTeamsInSeason,
  ActiveTeam,
} from "../teams/teams";
import { getAllGamesBy, Game } from "../games/games";
import { MIN_GAMES_BY_MATCH_TYPE } from "@/lib/common/constants/matchFormat";
import {
  mapWinProbability,
  PLAYOFF_ODDS_SIMULATIONS,
  shrunkMapWinRate,
} from "@/lib/common/playoffOdds";
import { pseudoRandomUnitInterval } from "@/lib/common/random";
import { ControlPanel } from "@/prisma";
import { getLeagueState, getPlayoffOddsEnabled } from "../control/control";

export type Standing = {
  franchiseSlug: string;
  teamLogo: string | null;
  teamName: string;
  wins: number;
  losses: number;
  mapWinPct: number;
  rwp: number;
};

function mapWinPercent(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

export type TeamStats = {
  wins: number;
  losses: number;
  roundsWon: number;
  roundsLost: number;
  totalRounds: number;
  rwp: number;
  h2hWins: number;
  h2hRounds: number;
  id: number;
  name: string;
  Franchise: {
    slug: string;
    Brand: {
      logo: string | null;
    } | null;
  };
};

/**
 * Number of teams that make the playoffs for a tier of the given size,
 * per rulebook section 16.2. Single source of truth for both standings
 * highlighting and the playoffs bracket.
 */
export function getPlayoffTeamCount(teamCount: number): number {
  if (teamCount === 4 || teamCount === 6) return 4;
  if (teamCount === 8 || teamCount === 10) return 6;
  if (teamCount === 12 || teamCount === 14) return 8;
  return 10;
}

export function getApexRankings(standings: Standing[]) {
  return getPlayoffTeamCount(standings.length);
}

export async function getStandingsByTier(
  seasonNumber: number,
  tier: Tier
): Promise<Standing[]> {
  const [games, teams] = await Promise.all([
    getAllGamesBy(tier, seasonNumber),
    getAllActiveTeamsIn(tier),
  ]);
  if (games.length === 0) {
    return [];
  }

  const rankedTeams = rankTeams(teams, games);

  return rankedTeams.map((team) => ({
    franchiseSlug: team.Franchise.slug,
    teamLogo: team.Franchise.Brand?.logo ?? null,
    teamName: team.name,
    wins: team.wins,
    losses: team.losses,
    mapWinPct: mapWinPercent(team.wins, team.losses),
    rwp: Math.round(team.rwp * 100) / 100,
  }));
}

/**
 * Rank a set of teams against a set of games using the league
 * tiebreaker rules (wins, head-to-head, RWP, alphabetical).
 */
export function rankTeams(teams: ActiveTeam[], games: Game[]): TeamStats[] {
  const teamStats = teams.map((team) => calculateTeamStats(team, games));
  return applyTiebreakers(teamStats, games);
}

/**
 * The higher-seeded of two teams in a tier's season,
 */
export const getHigherSeedTeamId = cache(
  async (
    tier: Tier,
    season: number,
    teamAId: number,
    teamBId: number,
  ): Promise<number | null> => {
    const [teams, games] = await Promise.all([
      getTeamsInSeason(tier, season),
      getAllGamesBy(tier, season),
    ]);
    if (games.length === 0) return null;

    const ranked = rankTeams(teams, games);
    const rankOfA = ranked.findIndex((team) => team.id === teamAId);
    const rankOfB = ranked.findIndex((team) => team.id === teamBId);
    if (rankOfA === -1 || rankOfB === -1) return null;

    return rankOfA < rankOfB ? teamAId : teamBId;
  },
);

export type PlayoffOddsRow = {
  teamId: number;
  franchiseSlug: string;
  odds: number;
};

type RemainingMap = { home: number; away: number };

export async function getPlayoffOdds(
  seasonNumber: number,
  tier: Tier
): Promise<PlayoffOddsRow[] | null> {
  const [leagueState, currentSeason, oddsEnabled] = await Promise.all([
    getLeagueState(),
    ControlPanel.getSeason(),
    getPlayoffOddsEnabled(),
  ]);
  if (!oddsEnabled) return null;
  if (leagueState !== "REGULAR_SEASON") return null;
  if (seasonNumber !== currentSeason) return null;

  const [games, teams, remainingMaps] = await Promise.all([
    getAllGamesBy(tier, seasonNumber),
    getAllActiveTeamsIn(tier),
    getRemainingMatchMaps(seasonNumber, tier),
  ]);
  if (games.length === 0 || teams.length === 0) return null;

  return simulatePlayoffOdds(seasonNumber, tier, teams, games, remainingMaps);
}

async function getRemainingMatchMaps(
  seasonNumber: number,
  tier: Tier
): Promise<RemainingMap[]> {
  const matches = await prisma.matches.findMany({
    where: { season: seasonNumber, tier, matchType: MatchType.BO2 },
    select: {
      home: true,
      away: true,
      Games: {
        where: {
          OR: [{ gameType: GameType.SEASON }, { gameType: GameType.FORFEIT }],
          winner: { not: null },
        },
        select: { gameID: true },
      },
    },
  });

  const mapsPerMatch = MIN_GAMES_BY_MATCH_TYPE[MatchType.BO2] ?? 2;
  const remainingMaps: RemainingMap[] = [];
  for (const match of matches) {
    if (match.home === null || match.away === null) continue;
    const mapsLeft = mapsPerMatch - match.Games.length;
    for (let mapIndex = 0; mapIndex < mapsLeft; mapIndex++) {
      remainingMaps.push({ home: match.home, away: match.away });
    }
  }
  return remainingMaps;
}

const SIMULATED_WINNER_ROUNDS = 13;
const SIMULATED_LOSER_ROUNDS = 8;
const SIMULATION_YIELD_INTERVAL = 500;

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

async function simulatePlayoffOdds(
  seasonNumber: number,
  tier: Tier,
  teams: ActiveTeam[],
  playedGames: Game[],
  remainingMaps: RemainingMap[]
): Promise<PlayoffOddsRow[]> {
  const strengthByTeam = buildStrengthByTeam(teams, playedGames);
  const playoffCount = getPlayoffTeamCount(teams.length);
  const seedBase = `playoff-odds:${seasonNumber}:${tier}:${playedGames.length}`;
  const qualifiedCounts = new Map<number, number>(
    teams.map((team) => [team.id, 0])
  );

  for (let sim = 0; sim < PLAYOFF_ODDS_SIMULATIONS; sim++) {
    if (sim > 0 && sim % SIMULATION_YIELD_INTERVAL === 0) {
      await yieldToEventLoop();
    }
    const syntheticGames = remainingMaps.map((map, mapIndex) =>
      simulateMap(map, strengthByTeam, `${seedBase}:${sim}:${mapIndex}`)
    );
    const ranked = rankTeams(teams, [...playedGames, ...syntheticGames]);
    for (const team of ranked.slice(0, playoffCount)) {
      qualifiedCounts.set(team.id, (qualifiedCounts.get(team.id) ?? 0) + 1);
    }
  }

  return teams.map((team) => ({
    teamId: team.id,
    franchiseSlug: team.Franchise.slug,
    odds: (qualifiedCounts.get(team.id) ?? 0) / PLAYOFF_ODDS_SIMULATIONS,
  }));
}

function buildStrengthByTeam(
  teams: ActiveTeam[],
  games: Game[]
): Map<number, number> {
  const strengthByTeam = new Map<number, number>();
  for (const team of teams) {
    const teamGames = games.filter(
      (game) => game.Match?.home === team.id || game.Match?.away === team.id
    );
    const mapWins = teamGames.filter((game) => game.winner === team.id).length;
    strengthByTeam.set(team.id, shrunkMapWinRate(mapWins, teamGames.length));
  }
  return strengthByTeam;
}

function simulateMap(
  map: RemainingMap,
  strengthByTeam: Map<number, number>,
  seed: string
): Game {
  const homeStrength = strengthByTeam.get(map.home) ?? 0.5;
  const awayStrength = strengthByTeam.get(map.away) ?? 0.5;
  const homeWinProbability = mapWinProbability(homeStrength, awayStrength);
  const homeWins = pseudoRandomUnitInterval(seed) < homeWinProbability;

  return {
    winner: homeWins ? map.home : map.away,
    rounds: SIMULATED_WINNER_ROUNDS + SIMULATED_LOSER_ROUNDS,
    roundsWonHome: homeWins
      ? SIMULATED_WINNER_ROUNDS
      : SIMULATED_LOSER_ROUNDS,
    roundsWonAway: homeWins
      ? SIMULATED_LOSER_ROUNDS
      : SIMULATED_WINNER_ROUNDS,
    Match: { home: map.home, away: map.away, matchDay: null },
  };
}

export async function getFranchiseStandings(
  seasonNumber: number
): Promise<Standing[]> {
  const [allBo2Games, franchises] = await Promise.all([
    getAllBo2Games(seasonNumber),
    getFranchises(),
  ]);

  if (allBo2Games.length === 0) {
    return [];
  }

  const rawStandings = franchises.map((franchise) =>
    buildFranchiseStanding(franchise, allBo2Games)
  );

  const sortedStandings = rawStandings.sort(compareStandings);
  return sortedStandings;
}

function compareStandings(left: Standing, right: Standing): number {
  if (right.mapWinPct !== left.mapWinPct) {
    return right.mapWinPct - left.mapWinPct;
  }
  if (right.wins !== left.wins) {
    return right.wins - left.wins;
  }
  if (right.rwp !== left.rwp) {
    return right.rwp - left.rwp;
  }
  return left.franchiseSlug.localeCompare(right.franchiseSlug);
}
/**
 * Return only the games where this team participated
 */
function filterGamesPlayedByTeam(teamId: number, allGames) {
  return allGames.filter(
    ({ Match }) => Match.home === teamId || Match.away === teamId
  );
}

/**
 * Compute wins, losses, roundsWon and totalRounds
 * for a single team
 */
function computeTeamRecord(teamId: number, games) {
  let wins = 0;
  let losses = 0;
  let roundsWon = 0;
  let totalRounds = 0;

  for (const g of games) {
    const didWin = g.winner === teamId;
    wins += didWin ? 1 : 0;
    losses += didWin ? 0 : 1;

    // if they won, add their side’s rounds
    const thisMatchWonRounds = g.Match.home === teamId
  ? g.roundsWonHome
  : g.roundsWonAway;

    roundsWon += thisMatchWonRounds;
    totalRounds += g.rounds;
  }

  return { wins, losses, roundsWon, totalRounds };
}

/**
 * Merge records of multiple teams
 * into a single franchise standing
 */
function buildFranchiseStanding(
  franchise: Awaited<ReturnType<typeof getFranchises>>[number],
  allGames
): Standing {
  let wins = 0,
    losses = 0,
    roundsWon = 0,
    totalRounds = 0;

  for (const { id: teamId } of franchise.Teams) {
    const teamGames = filterGamesPlayedByTeam(teamId, allGames);
    const record = computeTeamRecord(teamId, teamGames);
    wins += record.wins;
    losses += record.losses;
    roundsWon += record.roundsWon;
    totalRounds += record.totalRounds;
  }

  const rwp =
    totalRounds > 0 ? Math.round((roundsWon / totalRounds) * 100) / 100 : 0;
  return {
    franchiseSlug: franchise.slug,
    teamName: franchise.name,
    teamLogo: franchise.Brand!.logo,
    wins,
    losses,
    mapWinPct: mapWinPercent(wins, losses),
    rwp,
  };
}

/**
 * Fetch all BO2 games in the season
 * @param seasonNumber
 * @returns all BO2 games
 */
async function getAllBo2Games(seasonNumber: number) {
  const res = prisma.games.findMany({
    where: {
      season: seasonNumber,
      Match: {
        matchType: MatchType.BO2,
        AND: [{ Home: { active: true } }, { Away: { active: true } }],
      },
    },
    select: {
      winner: true,
      rounds: true,
      roundsWonHome: true,
      roundsWonAway: true,
      Match: {
        select: {
          home: true,
          away: true,
        },
      },
    },
  });

  
  return res;
}

/**
 * Fetch all active franchises but only the fields we need
 * plus each franchise's team IDs
 * @returns all active franchises
 */
async function getFranchises() {
  const res = await prisma.franchise.findMany({
    where: { active: true },
    select: {
      slug: true,
      name: true,
      Teams: { select: { id: true } },
      Brand: {
        select: {
          logo: true,
          colorPrimary: true,
          colorSecondary: true,
        },
      },
    },
  });
  
  
  return res;
}

function calculateTeamStats(team: ActiveTeam, allGames: Game[]) {
  const gamesPlayed = allGames.filter((g) =>
    [g.Match?.home, g.Match?.away].includes(team.id)
  );

  const totalGames = gamesPlayed.length;
  const wins = allGames.filter((game) => game.winner === team.id).length;
  const losses = totalGames - wins;

  const roundsWon = calculateRoundsWon(gamesPlayed, team);
  const roundsLost = calculateRoundsLost(gamesPlayed, team);

  const totalRounds = sum(gamesPlayed.map((game) => game.rounds));
  const rwp = totalRounds > 0 ? roundsWon / totalRounds : 0;

  return {
    ...team,
    wins,
    losses,
    roundsWon,
    roundsLost,
    totalRounds,
    rwp,
    h2hWins: 0,
    h2hRounds: 0,
  };
}

function calculateRoundsWon(gamesPlayed: Game[], team: ActiveTeam) {
  return sum(
    gamesPlayed.map((game) =>
      game.Match?.home === team.id ? game.roundsWonHome : game.roundsWonAway
    )
  );
}

function calculateRoundsLost(gamesPlayed: Game[], team: ActiveTeam) {
  return sum(
    gamesPlayed.map((game) =>
      game.Match?.home === team.id ? game.roundsWonAway : game.roundsWonHome
    )
  );
}

function applyTiebreakers(teamStats: TeamStats[], allGames: Game[]) {
  // sort by wins
  const sorted = [...teamStats].sort((a, b) => b.wins - a.wins);

  // find teams with equal wins
  const winCounts: Map<number, Array<TeamStats>> = new Map<
    number,
    Array<TeamStats>
  >();
  const tiebreakers: { team1: TeamStats; team2: TeamStats }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const team = sorted[i];
    if (winCounts.has(team.wins)) {
      winCounts.get(team.wins)?.push(team);
    } else {
      winCounts.set(team.wins, [team]);
    }
  }
  [...winCounts.entries()]
    .filter(([, teams]) => teams.length > 1)
    .forEach(([, teams]) => {
      const length = teams.length;
      for (let i = 0; i < length - 1; i++) {
        for (let x = i + 1; x < length; x++) {
          tiebreakers.push({ team1: teams[i], team2: teams[x] });
        }
      }
    });

  // for each tied, get net h2h wins and net h2h round differential. 
  tiebreakers.forEach(({ team1, team2 }) => {
    allGames.forEach((game) => {
      const isHeadToHead =
        (game.Match?.home === team1.id && game.Match?.away === team2.id) ||
        (game.Match?.home === team2.id && game.Match?.away === team1.id);
      if (!isHeadToHead) return;

      if (game.winner === team1.id) {
        team1.h2hWins++;
        team2.h2hWins--;
      } else if (game.winner === team2.id) {
        team2.h2hWins++;
        team1.h2hWins--;
      }

      const homeRoundDiff = game.roundsWonHome - game.roundsWonAway;
      if (team1.id === game.Match?.home) {
        team1.h2hRounds += homeRoundDiff;
        team2.h2hRounds -= homeRoundDiff;
      } else {
        team2.h2hRounds += homeRoundDiff;
        team1.h2hRounds -= homeRoundDiff;
      }
    });
  });
  // final sort: wins → H2H → H2H Round Diff -> RWP -> alphabetical (if it gets to it... lmao)
  return sorted.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.h2hWins !== a.h2hWins) return b.h2hWins - a.h2hWins;
    if (b.h2hRounds !== a.h2hRounds) return b.h2hRounds - a.h2hRounds;
    if (b.rwp !== a.rwp) return b.rwp - a.rwp;
    return a.name.localeCompare(b.name);
  });
}

function sum(values: number[]) {
  return values.reduce((acc, val) => acc + (val ?? 0), 0);
}
