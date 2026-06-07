import { TIERS_LIST } from "@/lib/common/constants";
import {
  getFreeAgentCountByTier,
  getSignedPlayerCount,
  getSignedPlayerCountByTier,
  getTotalFreeAgentCount,
} from "@/lib/queries/staff/admin";
import { LeagueStatus, Tier } from "@prisma/client";
import { NextResponse } from "next/server";

export type SignedTierCount = {
  tier: Tier;
  count: number;
};

export type FreeAgentTierCount = {
  tier: Tier;
  faCount: number;
  rfaCount: number;
};

export type AdminSummary = {
  signedPlayerCount: number;
  signedPlayerCountByTier: SignedTierCount[];
  freeAgentCount: number;
  freeAgentCountByTier: FreeAgentTierCount[];
};

export async function GET() {
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
