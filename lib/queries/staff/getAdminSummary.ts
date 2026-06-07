import { TIERS_LIST } from "@/lib/common/constants";
import { LeagueStatus, Tier } from "@prisma/client";
import {
  getFreeAgentCountByTier,
  getSignedPlayerCount,
  getSignedPlayerCountByTier,
  getTotalFreeAgentCount,
} from "./admin";

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

export async function getAdminSummary(): Promise<AdminSummary> {
  const [
    signedPlayerCount,
    freeAgentCount,
    signedPlayerCountByTier,
    freeAgentCountByTier,
  ] = await Promise.all([
    getSignedPlayerCount(),
    getTotalFreeAgentCount(),
    Promise.all(
      TIERS_LIST.map(async (tier) => ({
        tier,
        count: await getSignedPlayerCountByTier(tier),
      })),
    ),
    Promise.all(
      TIERS_LIST.map(async (tier) => ({
        tier,
        faCount: await getFreeAgentCountByTier(LeagueStatus.FREE_AGENT, tier),
        rfaCount: await getFreeAgentCountByTier(
          LeagueStatus.RESTRICTED_FREE_AGENT,
          tier,
        ),
      })),
    ),
  ]);

  return {
    signedPlayerCount,
    signedPlayerCountByTier,
    freeAgentCount,
    freeAgentCountByTier,
  };
}
