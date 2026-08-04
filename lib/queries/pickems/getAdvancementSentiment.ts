import { cache } from "react";
import { Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import { getAdvanceResult } from "./getAdvanceResult";
import {
  tallyAdvancement,
  type AdvanceSentimentRow,
} from "@/lib/pickems/sentiment";

export type TeamRef = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export type AdvanceSentimentRowView = AdvanceSentimentRow & {
  team: TeamRef | null;
};

export type AdvancementSentiment = {
  voters: number;
  rows: AdvanceSentimentRowView[];
  missedCut: AdvanceSentimentRowView[];
};

export const getAdvancementSentiment = cache(
  async (tier: Tier, season: number): Promise<AdvancementSentiment> => {
    const picks = await prisma.pickemAdvancePick.findMany({
      where: { season, tier },
      select: { userID: true, predictedTeam: true, predictedSeed: true },
    });

    const picksByUser = new Map<string, { teamId: number; seed: number }[]>();
    for (const pick of picks) {
      if (!picksByUser.has(pick.userID)) {
        picksByUser.set(pick.userID, []);
      }
      picksByUser.get(pick.userID)!.push({
        teamId: pick.predictedTeam,
        seed: pick.predictedSeed,
      });
    }

    const { rows, voters } = tallyAdvancement(picksByUser);

    const teams = await getTeamsInSeason(tier, season);
    const teamById = new Map<number, TeamRef>();
    for (const team of teams) {
      teamById.set(team.id, {
        id: team.id,
        name: team.name,
        slug: team.Franchise.slug,
        logo: team.Franchise.Brand?.logo ?? null,
      });
    }
    const withTeam = (row: AdvanceSentimentRow): AdvanceSentimentRowView => ({
      ...row,
      team: teamById.get(row.teamId) ?? null,
    });

    const advancedTeamIds = await getAdvanceResult(tier, season);
    const advancedIds = new Set(advancedTeamIds);
    const missedCut =
      advancedTeamIds.length === 0
        ? []
        : rows
            .filter((row) => !advancedIds.has(row.teamId))
            .slice(0, 5)
            .map(withTeam);

    return { voters, rows: rows.map(withTeam), missedCut };
  },
);
