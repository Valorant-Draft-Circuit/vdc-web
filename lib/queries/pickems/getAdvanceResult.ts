import { cache } from "react";
import { Tier } from "@prisma/client";
import { getAllGamesBy } from "@/lib/queries/games/games";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import {
  getPlayoffTeamCount,
  rankTeams,
} from "@/lib/queries/standings/standings";

export const getAdvanceResult = cache(
  async (tier: Tier, season: number): Promise<number[]> => {
    const [teams, games] = await Promise.all([
      getTeamsInSeason(tier, season),
      getAllGamesBy(tier, season),
    ]);
    if (teams.length === 0 || games.length === 0) {
      return [];
    }
    const ranked = rankTeams(teams, games);
    const cutoffSize = getPlayoffTeamCount(ranked.length);
    return ranked.slice(0, cutoffSize).map((team) => team.id);
  },
);
