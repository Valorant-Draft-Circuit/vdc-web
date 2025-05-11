import { Tier } from "@prisma/client";

const BUCKET_URL = "https://uni-objects.nyc3.cdn.digitaloceanspaces.com/vdc/";
export const DISCORD_LINK = "https://go.vdc.gg/discord";
export const RULEBOOK_URL = "https://blog.vdc.gg/rulebook/";
export const BEHAVIOR_GUIDELINE_URL =
  "https://docs.google.com/spreadsheets/d/14wmSU43cB2xf9IOCuW0-74Ec8AXt6I6UGZHJhDNJJGc/edit?gid=0#gid=0";
export const WEB_ASSET_URL = BUCKET_URL + "web-assets/";
export const TEAM_LOGOS_URL = BUCKET_URL + "team-logos/";
export const VDC_PURPLE = "#9b59b6";
export const VDC_BLUE = "#3498db";
export const VDC_GREEN = "#2ecc71";
export const VDC_YELLOW = "#f1c40f";

export const TIER_HEX_COLOR_MAP: Record<Tier, string> = {
  MYTHIC: VDC_PURPLE,
  EXPERT: VDC_BLUE,
  APPRENTICE: VDC_GREEN,
  PROSPECT: VDC_YELLOW,
  MIXED: "",
};

export const TIER_COLOR_MAP: Record<Tier, string> = {
  MYTHIC: "vdcPurple",
  EXPERT: "vdcBlue",
  APPRENTICE: "vdcGreen",
  PROSPECT: "vdcYellow",
  MIXED: "",
};
export const TIERS_LIST = [
  Tier.MYTHIC,
  Tier.EXPERT,
  Tier.APPRENTICE,
  Tier.PROSPECT,
];
export const TIER_ORDER = ["MYTHIC", "EXPERT", "APPRENTICE", "PROSPECT"];
