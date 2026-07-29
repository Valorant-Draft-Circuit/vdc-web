import { Tier } from "@prisma/client";
import { ControlPanel } from "@/prisma";
import { getMmmrTierLinesCached } from "./cache";
import { TIERS_ASCENDING } from "./constants/tiers";

type TierRange = { min: number; max: number };

export type MmrTierLines = {
  RECRUIT: TierRange;
  PROSPECT: TierRange;
  APPRENTICE: TierRange;
  EXPERT: TierRange;
  MYTHIC: TierRange;
};

export const isTier = (value: string): value is Tier => {
  return Object.values(Tier).includes(value as Tier);
};

function tierFromMmr(mmr: number, tierLines: MmrTierLines): Tier {
  for (let index = 0; index < TIERS_ASCENDING.length - 1; index++) {
    const tier = TIERS_ASCENDING[index];
    if (mmr <= tierLines[tier].max) return tier;
  }
  return TIERS_ASCENDING[TIERS_ASCENDING.length - 1];
}

export function determineTierWithTierLines(
  mmr: number | null,
  tierLines: MmrTierLines,
) {
  if (mmr === null) return null;
  return tierFromMmr(mmr, tierLines);
}

export async function determineTier(mmr: number | null) {
  if (mmr === null) return null;
  return tierFromMmr(mmr, await getMmmrTierLinesCached());
}

export async function getMMRTierLines(): Promise<MmrTierLines> {
  return (await ControlPanel.getMMRCaps("PLAYER")) as MmrTierLines;
}
