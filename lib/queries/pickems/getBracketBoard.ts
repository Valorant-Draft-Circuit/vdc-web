import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { correctMatchDate } from "@/lib/common/format";
import { slateLockTime } from "@/lib/pickems/format";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import type { Bracket } from "@/lib/common/bracket";
import type { BracketPick } from "@/lib/pickems/bracket";

export type BracketBoard = {
  bracket: Bracket;
  lock: Date | null;
};

export const getBracketLock = cache(
  async (tier: Tier, season: number): Promise<Date | null> => {
    const override = await prisma.controlPanel.findFirst({
      where: { id: ControlPanelID.PICKEM_BRACKET_LOCK },
      select: { value: true },
    });
    if (override?.value) {
      const overrideDate = new Date(override.value);
      if (!Number.isNaN(overrideDate.getTime())) {
        return overrideDate;
      }
    }

    const firstPlayoffMatch = await prisma.matches.aggregate({
      where: {
        tier,
        season,
        matchType: { in: [MatchType.BO3, MatchType.BO5] },
      },
      _min: { dateScheduled: true },
    });
    if (firstPlayoffMatch._min.dateScheduled === null) {
      return null;
    }
    return slateLockTime(correctMatchDate(firstPlayoffMatch._min.dateScheduled));
  },
);

export const getBracketBoard = cache(
  async (tier: Tier, season: number): Promise<BracketBoard> => {
    const [bracket, lock] = await Promise.all([
      getPlayoffBracket(tier, season),
      getBracketLock(tier, season),
    ]);
    return { bracket, lock };
  },
);

export const getUserBracketPicks = cache(
  async (
    userId: string,
    season: number,
    tier: Tier,
  ): Promise<BracketPick[]> => {
    const rows = await prisma.pickemBracketPick.findMany({
      where: { userID: userId, season, tier },
      select: {
        round: true,
        slot: true,
        predictedTeam: true,
        predictedLoserGames: true,
      },
    });
    return rows.map((row) => ({
      round: row.round,
      slot: row.slot,
      teamId: row.predictedTeam,
      loserGames: row.predictedLoserGames,
    }));
  },
);
