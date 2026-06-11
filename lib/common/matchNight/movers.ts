import { Tier } from "@prisma/client";
import { TeamStats } from "../../queries/standings/standings";
import { RecapMover } from "./types";

export function buildStandingsMovers(
  rankedBefore: TeamStats[],
  rankedAfter: TeamStats[],
  tier: Tier,
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
