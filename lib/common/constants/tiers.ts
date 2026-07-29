import { Tier } from "@prisma/client";
import {
  VDC_BLUE,
  VDC_GREEN,
  VDC_ORANGE,
  VDC_PURPLE,
  VDC_YELLOW,
} from "./colors";

export type RankedTier = Exclude<Tier, "MIXED">;

type TierMeta = {
  tier: RankedTier;
  token: string;
  hex: string;
  bg: string;
  bgGradient: string;
  outline: string;
  winnerGradient: string;
};

export const RANKED_TIERS: TierMeta[] = [
  {
    tier: Tier.MYTHIC,
    token: "vdcPurple",
    hex: VDC_PURPLE,
    bg: "bg-vdcPurple/15",
    bgGradient: "from-vdcPurple/30",
    outline: "outline-vdcPurple",
    winnerGradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-vdcPurple",
  },
  {
    tier: Tier.EXPERT,
    token: "vdcBlue",
    hex: VDC_BLUE,
    bg: "bg-vdcBlue/13",
    bgGradient: "from-vdcBlue/30",
    outline: "outline-vdcBlue",
    winnerGradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-vdcBlue",
  },
  {
    tier: Tier.APPRENTICE,
    token: "vdcGreen",
    hex: VDC_GREEN,
    bg: "bg-vdcGreen/7",
    bgGradient: "from-vdcGreen/30",
    outline: "outline-vdcGreen",
    winnerGradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-vdcGreen",
  },
  {
    tier: Tier.PROSPECT,
    token: "vdcYellow",
    hex: VDC_YELLOW,
    bg: "bg-vdcYellow/5",
    bgGradient: "from-vdcYellow/30",
    outline: "outline-vdcYellow",
    winnerGradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-vdcYellow",
  },
  {
    tier: Tier.RECRUIT,
    token: "vdcOrange",
    hex: VDC_ORANGE,
    bg: "bg-vdcOrange/10",
    bgGradient: "from-vdcOrange/30",
    outline: "outline-vdcOrange",
    winnerGradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-vdcOrange",
  },
];

const MIXED_WINNER_GRADIENT = "bg-gradient-to-br from-yellow-300 to-amber-500";

function tierRecord<T>(pick: (meta: TierMeta) => T, mixed: T): Record<Tier, T> {
  const record = { MIXED: mixed } as Record<Tier, T>;
  for (const meta of RANKED_TIERS) {
    record[meta.tier] = pick(meta);
  }
  return record;
}

export const TIERS_LIST: RankedTier[] = RANKED_TIERS.map((meta) => meta.tier);

export const TIER_ORDER: readonly string[] = TIERS_LIST;

export const TIERS_ASCENDING: RankedTier[] = [...TIERS_LIST].reverse();

const rankRecord = { MIXED: 0 } as Record<Tier, number>;
RANKED_TIERS.forEach((meta, index) => {
  rankRecord[meta.tier] = RANKED_TIERS.length - index;
});
export const TIER_RANK: Record<Tier, number> = rankRecord;

export const TIER_HEX_COLOR_MAP = tierRecord((meta) => meta.hex, "");

export const TIER_COLOR_MAP = tierRecord((meta) => meta.token, "");

export const TIER_BG_MAP = tierRecord((meta) => meta.bg, "bg-vdcRed/10");

export const TIER_BG_GRADIENT_MAP = tierRecord(
  (meta) => meta.bgGradient,
  "from-vdcRed/30",
);

export const TIER_OUTLINE_MAP = tierRecord(
  (meta) => meta.outline,
  "outline-vdcRed",
);

export const TIER_WINNER_GRADIENT_MAP = tierRecord(
  (meta) => meta.winnerGradient,
  MIXED_WINNER_GRADIENT,
);
