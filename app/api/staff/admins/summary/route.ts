import { TIERS_LIST } from "@/lib/common/constants";
import {
  getFreeAgentCountByTier,
  getSignedPlayerCount,
  getSignedPlayerCountByTier,
  getTotalFreeAgentCount,
} from "@/lib/queries/staff/admin";
import { LeagueStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export type TTierCount = {
  Tier: number;
};

export type TSummary = {
  signedPlayerCount: number;
  signedPlayerCountByTier: TTierCount;
  freeAgentCount: number;
  freeAgentCountByTier: TTierCount;
  rfaCountByTier: TTierCount;
};

export async function GET(request: NextRequest) {
  const signedPlayerCount = await getSignedPlayerCount();
  const freeAgentCount = await getTotalFreeAgentCount();
  const signedCountByTier = await Promise.all(
    TIERS_LIST.map(async (tier) => {
      return {
        tier,
        count: await getSignedPlayerCountByTier(tier),
      };
    })
  );
  const freeAgentCountByTier = await Promise.all(
    TIERS_LIST.map(async (tier) => {
      return {
        tier,
        faCount: await getFreeAgentCountByTier(LeagueStatus.FREE_AGENT, tier),
        rfaCount: await getFreeAgentCountByTier(
          LeagueStatus.RESTRICTED_FREE_AGENT,
          tier
        ),
      };
    })
  );

  const payload = {
    signedPlayerCount: signedPlayerCount,
    signedPlayerCountByTier: signedCountByTier,
    freeAgentCount: freeAgentCount,
    freeAgentCountByTier: freeAgentCountByTier,
  };
  return NextResponse.json(payload);
}
