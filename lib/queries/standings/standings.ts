import { MatchType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Tier } from "@prisma/client";
import { getAllActiveTeamsIn, ActiveTeam } from "../teams/teams";
import { getAllGamesBy, Game } from "../games/games";

export type Standing = {
  franchiseSlug: string;
  teamLogo: string | null;
  teamName: string;
  wins: number;
  losses: number;
  rwp: number;
};

export type TeamStats = {
  wins: number;
  losses: number;
  roundsWon: number;
  roundsLost: number;
  totalRounds: number;
  rwp: number;
  h2hWins: number;
  id: number;
  name: string;
  Franchise: {
    slug: string;
    Brand: {
      logo: string | null;
    } | null;
  };
};

export function getApexRankings(standings: Standing[]) {
  const highlight =
    standings.length === 4 || standings.length === 6
      ? 4
      : standings.length === 8 || standings.length === 10
      ? 6
      : standings.length === 12 || standings.length === 14
      ? 8
      : 10;
  return highlight;
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
  

  // 1) compare wins (more is good!)
  if (right.wins > left.wins) return 1;
  if (right.wins < left.wins) return -1;

  // 2) then losses (less is good!)
  if (left.losses < right.losses) return -1;
  if (left.losses > right.losses) return 1;

  // 3) then compare RWP (higher is better!)
  if (right.rwp > left.rwp) return 1;
  if (right.rwp < left.rwp) return -1;

  // 4) alphabetical (if it somehow gets to this...)
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
  const tiebreakers: { team1: TeamStats; team2: TeamStats }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].wins === sorted[i - 1].wins) {
      tiebreakers.push({ team1: sorted[i - 1], team2: sorted[i] });
    }
  }

  // apply h2h tiebreakers
  tiebreakers.forEach(({ team1, team2 }) => {
    allGames.forEach((game) => {
      if (
        (game.Match?.home === team1.id && game.Match?.away === team2.id) ||
        (game.Match?.home === team2.id && game.Match?.away === team1.id)
      ) {
        if (game.winner === team1.id) team1.h2hWins++;
        else if (game.winner === team2.id) team2.h2hWins++;
      }
    });
  });

  // final sort: wins → H2H → RWP -> alphabetical (if it gets to it... lmao)
  return sorted.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.h2hWins !== a.h2hWins) return b.h2hWins - a.h2hWins;
    if (b.rwp !== a.rwp) return b.rwp - a.rwp;
    return a.name.localeCompare(b.name);
  });
}

function sum(values: number[]) {
  return values.reduce((acc, val) => acc + (val ?? 0), 0);
}
