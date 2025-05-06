import { StandingProps } from "@/components/standings/StandingsCard";
import { prisma } from "@/prisma/prismadb";
import { GameType, Tier } from "@prisma/client";

type Team = {
  id: number;
  name: string;
  Franchise: {
    slug: string;
    Brand: {
      logo: string | null;
    } | null;
  };
};

type Game = {
  winner: number | null;
  rounds: number;
  roundsWonHome: number;
  roundsWonAway: number;
  Match: {
    home: number | null;
    away: number | null;
  } | null;
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

export async function getStandingsByTier(
  seasonNumber: number,
  tier: Tier
): Promise<StandingProps[]> {
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
    rwp: team.rwp,
  }));
}

function calculateTeamStats(team: Team, allGames: Game[]) {
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

function calculateRoundsWon(gamesPlayed: Game[], team: Team) {
  return sum(
    gamesPlayed.map((game) =>
      game.Match?.home === team.id ? game.roundsWonHome : game.roundsWonAway
    )
  );
}

function calculateRoundsLost(gamesPlayed: Game[], team: Team) {
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

/**
 * Fetch all Games by the specified tier and season
 * @param tier
 * @param seasonNumber
 * @returns all Games by the specified tier and season
 */
async function getAllGamesBy(
  tier: Tier,
  seasonNumber: number
): Promise<Game[]> {
  return prisma.games.findMany({
    where: {
      tier,
      season: seasonNumber,
      OR: [{ gameType: GameType.SEASON }, { gameType: GameType.FORFEIT }],
      winner: { not: null },
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
}

/**
 * Fetch all active teams in a given tier
 * @param tier
 * @returns All active teams in a given tier
 */
async function getAllActiveTeamsIn(tier: Tier): Promise<Team[]> {
  return prisma.teams.findMany({
    where: { tier, active: true },
    select: {
      id: true,
      name: true,
      Franchise: {
        select: {
          slug: true,
          Brand: {
            select: {
              logo: true,
            },
          },
        },
      },
    },
  });
}
