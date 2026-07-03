import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { correctMatchDate } from "@/lib/common/format";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import { getPlayoffTeamCount } from "@/lib/queries/standings/standings";

export type AdvanceTeam = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  group: number | null;
};
export type AdvanceBoard = { n: number; teams: AdvanceTeam[] };

export const getAdvanceBoard = cache(
  async (tier: Tier, season: number): Promise<AdvanceBoard> => {
    const teams = await getTeamsInSeason(tier, season);
    const cutoffSize = getPlayoffTeamCount(teams.length);

    const matches = await prisma.matches.findMany({
      where: {
        tier,
        season,
        matchType: { in: [MatchType.BO2, MatchType.PRE_SEASON] },
      },
      select: { home: true, away: true, group: true },
    });

    const groupByTeam = new Map<number, number | null>();
    for (const match of matches) {
      if (match.home !== null && !groupByTeam.has(match.home)) {
        groupByTeam.set(match.home, match.group);
      }
      if (match.away !== null && !groupByTeam.has(match.away)) {
        groupByTeam.set(match.away, match.group);
      }
    }

    return {
      n: cutoffSize,
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        slug: team.Franchise.slug,
        logo: team.Franchise.Brand?.logo ?? null,
        group: groupByTeam.get(team.id) ?? null,
      })),
    };
  },
);

export const getAdvanceLock = cache(
  async (tier: Tier, season: number): Promise<Date | null> => {
    const override = await prisma.controlPanel.findFirst({
      where: { id: ControlPanelID.PICKEM_ADVANCE_LOCK },
      select: { value: true },
    });
    if (override?.value) {
      const overrideDate = new Date(override.value);
      if (!Number.isNaN(overrideDate.getTime())) {
        return overrideDate;
      }
    }

    const firstRegularSeasonMatch = await prisma.matches.aggregate({
      where: { tier, season, matchType: MatchType.BO2 },
      _min: { dateScheduled: true },
    });
    if (firstRegularSeasonMatch._min.dateScheduled === null) {
      return null;
    }
    return correctMatchDate(firstRegularSeasonMatch._min.dateScheduled);
  },
);

export const getPickemPreview = cache(async (): Promise<boolean> => {
  const row = await prisma.controlPanel.findFirst({
    where: { id: ControlPanelID.PICKEM_PREVIEW },
    select: { value: true },
  });
  if (!row?.value) {
    return true;
  }
  return row.value === "true";
});

export const getPickemEnabled = cache(async (): Promise<boolean> => {
  const row = await prisma.controlPanel.findFirst({
    where: { id: ControlPanelID.PICKEM_ENABLED },
    select: { value: true },
  });
  // Fail closed: stay disabled until an admin row explicitly turns it on, so the
  // feature is dark on a database that lacks the pickem tables/control rows.
  if (!row?.value) {
    return false;
  }
  return row.value === "true";
});
