import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAllActiveTeamsIn } from "@/lib/queries/teams/teams";
import { getAllGamesBy } from "@/lib/queries/games/games";
import {
  getPlayoffTeamCount,
  rankTeams,
} from "@/lib/queries/standings/standings";
import {
  Bracket,
  BracketTeam,
  PlayoffMatchInput,
  buildBracket,
} from "@/lib/common/bracket";

async function getPlayoffMatches(tier: Tier, season: number) {
  return prisma.matches.findMany({
    where: {
      tier,
      season,
      matchType: { in: [MatchType.BO3, MatchType.BO5] },
      Home: { active: true },
      Away: { active: true },
    },
    select: {
      matchID: true,
      matchType: true,
      matchDay: true,
      home: true,
      away: true,
      Games: { select: { winner: true } },
    },
    orderBy: [{ matchDay: "asc" }],
  });
}

type RawPlayoffMatch = Awaited<ReturnType<typeof getPlayoffMatches>>[number];

function toPlayoffMatchInput(match: RawPlayoffMatch): PlayoffMatchInput {
  let homeScore = 0;
  let awayScore = 0;
  for (const game of match.Games) {
    if (game.winner === match.home) homeScore++;
    else if (game.winner === match.away) awayScore++;
  }
  return {
    matchId: match.matchID,
    matchType: match.matchType,
    matchDay: match.matchDay,
    homeTeamId: match.home,
    awayTeamId: match.away,
    homeScore,
    awayScore,
  };
}

export async function getPlayoffBracket(
  tier: Tier,
  season: number,
): Promise<Bracket> {
  const [teams, games] = await Promise.all([
    getAllActiveTeamsIn(tier),
    getAllGamesBy(tier, season),
  ]);

  if (games.length === 0) {
    return { rounds: [], isInferable: false };
  }

  const ranked = rankTeams(teams, games);
  const seededTeams: BracketTeam[] = ranked.map((team, index) => ({
    id: team.id,
    seed: index + 1,
    name: team.name,
    franchiseSlug: team.Franchise.slug,
    logo: team.Franchise.Brand?.logo ?? null,
  }));

  const playoffTeamCount = getPlayoffTeamCount(ranked.length);
  const rawMatches = await getPlayoffMatches(tier, season);
  const matchInputs = rawMatches.map(toPlayoffMatchInput);

  return buildBracket(seededTeams, matchInputs, playoffTeamCount);
}
