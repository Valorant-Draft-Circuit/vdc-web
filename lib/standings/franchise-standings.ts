import { prisma } from "@/prisma/prismadb";
import { MatchType } from "@prisma/client";

export default async function getFranchiseStandings(seasonNumber: number) {
  // 1) Fetch all BO2 games in the season
  console.log(prisma)
  const allGames = await prisma.games.findMany({
    where: {
      season: seasonNumber,
      Match: {
        matchType: MatchType.BO2,
        AND: [{ Home: { active: true } }, { Away: { active: true } }],
      },
    },
    include: { Match: true },
  });

  // 2) Fetch only the fields we need plus each franchise's team IDs
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

  // 3) Compute wins, rounds, etc., on a fresh object
  const standings = franchises
    .map((f) => {
      let wins = 0;
      let losses = 0;
      let roundsWon = 0;
      let totalRounds = 0;

      // for each team in the franchise...
      f.Teams.forEach(({ id: teamId }) => {
        const played = allGames.filter(
          (g) => g.Match!.home === teamId || g.Match!.away === teamId
        );
        played.forEach((g) => {
          const didWin = g.winner === teamId;
          wins += didWin ? 1 : 0;
          losses += didWin ? 0 : 1;

          const wonThisMatch = didWin
            ? g.Match!.home === teamId
              ? g.roundsWonHome
              : g.roundsWonAway
            : 0;

          roundsWon += wonThisMatch;
          totalRounds += g.rounds;
        });
      });

      const rwp = totalRounds > 0 ? roundsWon / totalRounds : 0;
      return {
        teamName: f.name,
        teamLogo: f.Brand!.logo,
        wins,
        losses,
        rwp,
        franchiseSlug: f.slug,
      };
    })
    // 4) sort by RWP first, then by total wins
    .sort((a, b) => (b.rwp === a.rwp ? b.wins - a.wins : b.rwp - a.rwp));

  await prisma.$disconnect();
  return standings;
}
