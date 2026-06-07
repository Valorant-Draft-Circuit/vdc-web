import { MatchType } from "@prisma/client";

export function packageMatch(
  match,
  homeWins,
  awayWins,
  formattedDate,
  knockoutType?,
  playoffRound?,
) {
  const homeTeam = match.Home!;
  const awayTeam = match.Away!;
  return {
    id: match.matchID,
    date: formattedDate,
    tier: match.tier,
    homeWins: homeWins,
    awayWins: awayWins,
    matchType: match.matchType,
    knockoutType: knockoutType,
    playoffRound: playoffRound,
    Home: {
      id: homeTeam.id,
      name: homeTeam.name,
      logo: homeTeam.Franchise.Brand?.logo,
      slug: homeTeam.Franchise.slug,
    },
    Away: {
      id: awayTeam.id,
      name: awayTeam.name,
      logo: awayTeam.Franchise.Brand?.logo,
      slug: awayTeam.Franchise.slug,
    },
    Games: match.Games,
  };
}

export function determineIfKnockout(match) {
  if (match.matchType === MatchType.BO3) {
    return "PLAYOFFS";
  } else if (match.matchType === MatchType.BO5) {
    return "GRAND FINALS";
  } else {
    return "";
  }
}
