import { cache } from "react";
import { Tier } from "@prisma/client";
import { getSeasonCached } from "@/lib/common/cache";
import { getLeagueState } from "@/lib/queries/control/control";
import { getAllGamesBy } from "@/lib/queries/games/games";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import { seedsAreRevealed } from "@/lib/queries/playoffs/seedReveal";
import {
  getPlayoffTeamCount,
  rankTeams,
} from "@/lib/queries/standings/standings";

export const getAdvanceResult = cache(
  async (tier: Tier, season: number): Promise<number[]> => {
    const [currentSeason, leagueState] = await Promise.all([
      getSeasonCached(),
      getLeagueState(),
    ]);
    if (!seedsAreRevealed(season, currentSeason, leagueState)) {
      return [];
    }

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
