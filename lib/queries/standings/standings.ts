import { TStandingProps } from "@/components/standings/StandingsCard";
import { MatchType, Prisma } from "@prisma/client";
import { prisma } from "@/prisma/prismadb";
import { GameType, Tier } from "@prisma/client";
import { getAllActiveTeamsIn, TActiveTeam } from "../teams/teams";
import { getAllGamesBy, TGame } from "../games/games";

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

export function getApexRankings(standings: TStandingProps[]) {
  const highlight =
    standings.length === 4 || standings.length === 8
      ? 4
      : standings.length === 10 || standings.length === 12
      ? 6
      : standings.length === 14 || standings.length === 16
      ? 8
      : 4;
  return highlight;
}

export async function getStandingsByTier(
  seasonNumber: number,
  tier: Tier
): Promise<TStandingProps[]> {
  const [games, teams] = await Promise.all([
    getAllGamesBy(tier, seasonNumber),
    getAllActiveTeamsIn(tier),
  ]);
  if (games.length === 0) {
    return [];
  }

  const teamStats = teams.map((team) => calculateTeamStats(team, games));
  const rankedTeams = applyTiebreakers(teamStats, games);

  return rankedTeams.map((team) => ({
    franchiseSlug: team.Franchise.slug,
    teamLogo: team.Franchise.Brand?.logo ?? null,
    teamName: team.name,
    wins: team.wins,
    losses: team.losses,
    rwp: Math.round(team.rwp * 100) / 100,
  }));
}

export async function getFranchiseStandings(
  seasonNumber: number
): Promise<TStandingProps[]> {
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

function compareStandings(left: TStandingProps, right: TStandingProps): number {
  // 1) compare RWP
  if (right.rwp > left.rwp) return 1;
  if (right.rwp < left.rwp) return -1;

  // 2) then wins (more is good!)
  if (right.wins > left.wins) return 1;
  if (right.wins < left.wins) return -1;

  // 3) then losses (less is good!)
  if (left.losses < right.losses) return 1;
  if (left.losses > right.losses) return -1;

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
    const thisMatchWonRounds = didWin
      ? g.Match.home === teamId
        ? g.roundsWonHome
        : g.roundsWonAway
      : 0;

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
): TStandingProps {
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
  await prisma.$disconnect();
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
  await prisma.$disconnect();
  return res;
}

function calculateTeamStats(team: TActiveTeam, allGames: TGame[]) {
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

function calculateRoundsWon(gamesPlayed: TGame[], team: TActiveTeam) {
  return sum(
    gamesPlayed.map((game) =>
      game.Match?.home === team.id ? game.roundsWonHome : game.roundsWonAway
    )
  );
}

function calculateRoundsLost(gamesPlayed: TGame[], team: TActiveTeam) {
  return sum(
    gamesPlayed.map((game) =>
      game.Match?.home === team.id ? game.roundsWonAway : game.roundsWonHome
    )
  );
}

function applyTiebreakers(teamStats: TeamStats[], allGames: TGame[]) {
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
