import { cache } from "react";
import { Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { getAllGamesBy } from "@/lib/queries/games/games";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import {
  getPlayoffTeamCount,
  rankTeams,
} from "@/lib/queries/standings/standings";

export const getAdvanceResult = cache(
  async (tier: Tier, season: number): Promise<number[]> => {
    // Advancement picks stay unresolved (no points) until playoffs start.
    // Before then the cutoff would just reflect live regular-season standings
    // and award points off in-progress results.
    const leagueState = await prisma.controlPanel.findFirst({
      where: { id: ControlPanelID.LEAGUE_STATE },
      select: { value: true },
    });
    if (leagueState?.value !== "PLAYOFFS") {
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
