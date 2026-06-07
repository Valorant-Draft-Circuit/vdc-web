import { Tier } from "@prisma/client";
import { ControlPanel } from "@/prisma";
import { getMmmrTierLinesCached } from "./cache";

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

export function determineTierWithTierLines(
  mmr: number | null,
  tierLines: MmrTierLines,
) {
  if (mmr === null) return null;

  const { RECRUIT, PROSPECT, APPRENTICE, EXPERT } = tierLines;
  if (mmr <= RECRUIT.max) return Tier.RECRUIT;
  if (mmr <= PROSPECT.max) return Tier.PROSPECT;
  if (mmr <= APPRENTICE.max) return Tier.APPRENTICE;
  if (mmr <= EXPERT.max) return Tier.EXPERT;
  return Tier.MYTHIC;
}

export async function determineTier(mmr: number | null) {
  if (mmr === null) return null;
  const { RECRUIT, PROSPECT, APPRENTICE, EXPERT } =
    await getMmmrTierLinesCached();
  if (mmr <= RECRUIT.max) return Tier.RECRUIT;
  if (mmr <= PROSPECT.max) return Tier.PROSPECT;
  if (mmr <= APPRENTICE.max) return Tier.APPRENTICE;
  if (mmr <= EXPERT.max) return Tier.EXPERT;
  return Tier.MYTHIC;
}

export async function getMMRTierLines(): Promise<MmrTierLines> {
  return (await ControlPanel.getMMRCaps("PLAYER")) as MmrTierLines;
}
