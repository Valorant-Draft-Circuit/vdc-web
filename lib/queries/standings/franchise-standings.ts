import { MatchType } from "@prisma/client";
import { prisma } from "@/prisma/prismadb";
import { StandingProps } from "@/components/standings/StandingsCard";

export async function getFranchiseStandings(
  seasonNumber: number
): Promise<StandingProps[]> {
  const [allBo2Games, franchises] = await Promise.all([
    getAllBo2Games(seasonNumber),
    getFranchises(),
  ]);

  const rawStandings = franchises.map((franchise) =>
    buildFranchiseStanding(franchise, allBo2Games)
  );

  const sortedStandings = rawStandings.sort(compareStandings);
  return sortedStandings;
}

function compareStandings(left: StandingProps, right: StandingProps): number {
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
): StandingProps {
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

  const rwp = totalRounds > 0 ? roundsWon / totalRounds : 0;
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
  return prisma.games.findMany({
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
}

/**
 * Fetch all active franchises but only the fields we need
 * plus each franchise's team IDs
 * @returns all active franchises
 */
async function getFranchises() {
  const franchises = await prisma.franchise.findMany({
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
  return franchises;
}
