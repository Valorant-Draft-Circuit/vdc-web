import { Tier } from "@prisma/client";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import { getLeaderboard } from "@/lib/queries/pickems/getLeaderboard";
import { getGroupLeaderboard } from "@/lib/queries/pickems/getGroupLeaderboard";

export type SeasonPickemAwards = {
  overall: string[];
  perTier: Record<Tier, string | null>;
  topGroup: { groupId: number; name: string; memberUserIds: string[] } | null;
};

export async function getSeasonPickemAwards(
  season: number,
): Promise<SeasonPickemAwards> {
  const overallBoard = await getLeaderboard(season, null, { kind: "global" });
  const overall = overallBoard.slice(0, 3).map((row) => row.userId);

  const perTier = {} as Record<Tier, string | null>;
  for (const tier of TIERS_LIST) {
    const board = await getLeaderboard(season, tier, { kind: "global" });
    perTier[tier] = board[0]?.userId ?? null;
  }

  const groups = await getGroupLeaderboard(season, null);
  const best = groups[0];
  let topGroup: SeasonPickemAwards["topGroup"] = null;
  if (best !== undefined && best.participantCount > 0) {
    const memberRows = await getLeaderboard(season, null, {
      kind: "group",
      groupId: best.groupId,
    });
    topGroup = {
      groupId: best.groupId,
      name: best.name,
      memberUserIds: memberRows.map((row) => row.userId),
    };
  }

  return { overall, perTier, topGroup };
}
