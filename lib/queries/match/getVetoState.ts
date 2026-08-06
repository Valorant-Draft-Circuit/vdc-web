import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { MatchType, VetoSource } from "@prisma/client";
import { deriveVetoState, VetoState } from "@/lib/common/mapbansFlow";
import { getHigherSeedTeamId } from "@/lib/queries/standings/standings";

export type VetoOwnership = "none" | "web" | "bot";

export type MatchVeto = {
  state: VetoState;
  ownership: VetoOwnership;
  vetoUrl: string | null;
  banOrder: string[];
  mapPool: string[];
  deciderSideChooserTeamId: number | null;
};

const PLAYOFF_MATCH_TYPES: MatchType[] = [MatchType.BO3, MatchType.BO5];

export const getVetoState = cache(
  async (matchID: number, matchType: MatchType): Promise<MatchVeto | null> => {
    if (matchType === MatchType.PRE_SEASON) return null;

    const [rows, banOrderStr, mapPoolStr] = await Promise.all([
      prisma.mapBans.findMany({ where: { matchID }, orderBy: { order: "asc" } }),
      ControlPanel.getBanOrder(matchType),
      ControlPanel.getMapPool(),
    ]);

    const deciderSideChooserTeamId = await getPlayoffDeciderSideChooser(
      matchID,
      matchType,
    );

    const banOrder = banOrderStr.split(",");
    const mapPool = mapPoolStr.split(",");
    const state = deriveVetoState(rows, mapPool, deciderSideChooserTeamId);

    const isWebOwned = rows.some((row) => row.source === VetoSource.WEB);
    const ownership: VetoOwnership =
      rows.length === 0 ? "none" : isWebOwned ? "web" : "bot";
    const vetoUrl = rows.find((row) => row.vetoUrl)?.vetoUrl ?? null;

    return {
      state,
      ownership,
      vetoUrl,
      banOrder,
      mapPool,
      deciderSideChooserTeamId,
    };
  },
);

async function getPlayoffDeciderSideChooser(
  matchID: number,
  matchType: MatchType,
): Promise<number | null> {
  if (!PLAYOFF_MATCH_TYPES.includes(matchType)) return null;
  const match = await prisma.matches.findUnique({
    where: { matchID },
    select: { tier: true, season: true, home: true, away: true },
  });
  if (!match || match.home === null || match.away === null) return null;
  return getHigherSeedTeamId(
    match.tier,
    match.season,
    match.home,
    match.away,
  );
}

export const getViewerVetoRole = cache(
  async (
    userId: string | null,
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<{ teamId: number | null }> => {
    if (!userId) return { teamId: null };
    const user = await prisma.user.findFirst({
      where: { id: userId, team: { in: [homeTeamId, awayTeamId] } },
      select: { team: true },
    });
    return { teamId: user?.team ?? null };
  },
);
