import { Tier } from "@prisma/client";
import {
  VDC_BLUE,
  VDC_GREEN,
  VDC_ORANGE,
  VDC_PURPLE,
  VDC_YELLOW,
} from "./colors";

export const TIER_HEX_COLOR_MAP: Record<Tier, string> = {
  MYTHIC: VDC_PURPLE,
  EXPERT: VDC_BLUE,
  APPRENTICE: VDC_GREEN,
  PROSPECT: VDC_YELLOW,
  RECRUIT: VDC_ORANGE,
  MIXED: "",
};

export const TIER_COLOR_MAP: Record<Tier, string> = {
  MYTHIC: "vdcPurple",
  EXPERT: "vdcBlue",
  APPRENTICE: "vdcGreen",
  PROSPECT: "vdcYellow",
  RECRUIT: "vdcOrange",
  MIXED: "",
};

export const TIERS_LIST = [
  Tier.MYTHIC,
  Tier.EXPERT,
  Tier.APPRENTICE,
  Tier.PROSPECT,
  Tier.RECRUIT,
];

export const TIER_ORDER = [
  "MYTHIC",
  "EXPERT",
  "APPRENTICE",
  "PROSPECT",
  "RECRUIT",
];
