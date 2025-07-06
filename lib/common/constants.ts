import { Roles } from "@/prisma";
import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { LeagueStatus, Tier } from "@prisma/client";

const BUCKET_URL = "https://uni-objects.nyc3.cdn.digitaloceanspaces.com/vdc/";
export const DISCORD_LINK = "https://go.vdc.gg/discord";
export const RULEBOOK_URL = "https://blog.vdc.gg/rulebook/";
export const BEHAVIOR_GUIDELINE_URL =
  "https://docs.google.com/spreadsheets/d/14wmSU43cB2xf9IOCuW0-74Ec8AXt6I6UGZHJhDNJJGc/edit?gid=0#gid=0";
export const DISCORD_USER_HOWTO_URL =
  "https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID#h_01HRSTXPS5H5D7JBY2QKKPVKNA";

export const TRACKER_PROFILE_URL = "https://tracker.gg/valorant/profile/riot";
export const WEB_ASSET_URL = BUCKET_URL + "web-assets/";
export const TEAM_LOGOS_URL = BUCKET_URL + "team-logos/";
export const VDC_ASSETS_URL =
  "https://vdc-assets.nyc3.cdn.digitaloceanspaces.com";

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

export const AGENTS = {
  GEKKO: "e370fa57-4757-3604-3648-499e1f642d3f",
  FADE: "dade69b4-4f5a-8528-247b-219e5a1facd6",
  BREACH: "5f8d3a7f-467b-97f3-062c-13acf203c006",
  DEADLOCK: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
  RAZE: "f94c3b30-42be-e959-889c-5aa313dba261",
  CHAMBER: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
  "KAY/O": "601dbbe7-43ce-be57-2a40-4abd24953621",
  SKYE: "6f2a04ca-43e0-be17-7f36-b3908627744d",
  CYPHER: "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
  SOVA: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
  KILLJOY: "1e58de9c-4950-5125-93e9-a0aee9f98746",
  HARBOR: "95b78ed7-4637-86d9-7e41-71ba8c293152",
  VYSE: "efba5359-4016-a1e5-7626-b1ae76895940",
  VIPER: "707eab51-4836-f488-046a-cda6bf494859",
  PHOENIX: "eb93336a-449b-9c1b-0a54-a891f7921d69",
  ASTRA: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
  BRIMSTONE: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
  ISO: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
  CLOVE: "1dbf2edd-4729-0984-3115-daa5eed44993",
  NEON: "bb2a4828-46eb-8cd1-e765-15848195d751",
  YORU: "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
  SAGE: "569fdd95-4d10-43ab-ca70-79becc718b46",
  REYNA: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
  OMEN: "8e253930-4c05-31dd-1b6c-968525494517",
  JETT: "add6443a-41bd-e414-f6ad-e58d267f4e95",
  TEJO: "b444168c-4e35-8076-db47-ef9bf368f384",
  WAYLAY: "df1cb487-4902-002e-5c17-d28e83e78588",
};
export const AGENTURL = (UUID) => {
  return `https://media.valorant-api.com/agents/${UUID}/displayicon.png`;
};

export const MAPS = {
  ASCENT: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
  SPLIT: "d960549e-485c-e861-8d71-aa9d1aed12a2",
  FRACTURE: "b529448b-4d60-346e-e89e-00a4c527a405",
  BIND: "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
  BREEZE: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
  ABYSS: "224b0a95-48b9-f703-1bd8-67aca101a61f",
  LOTUS: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
  SUNSET: "92584fbe-486a-b1b2-9faa-39b0f486b498",
  PEARL: "fd267378-4d1d-484f-ff52-77821ed10dc2",
  ICEBOX: "e2ad5c54-4114-a870-9641-8ea21279579a",
  CORRODE: "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
  HAVEN: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
};

export const MAP_LIST_URL = (UUID) => {
  return `https://media.valorant-api.com/maps/${UUID}/splash.png`;
};

export const STATUS_LABELS: Record<LeagueStatus, string> = {
  [LeagueStatus.GENERAL_MANAGER]: "GM/AGM",
  [LeagueStatus.FREE_AGENT]: "FA",
  [LeagueStatus.RESTRICTED_FREE_AGENT]: "RFA",
  [LeagueStatus.SIGNED]: "SIGNED",
  [LeagueStatus.UNREGISTERED]: "Viewer",
  [LeagueStatus.DRAFT_ELIGIBLE]: "DE",
  [LeagueStatus.SUSPENDED]: "SUSPENDED",
  [LeagueStatus.RETIRED]: "RETIRED",
  [LeagueStatus.PENDING]: "PENDING",
  [LeagueStatus.APPROVED]: "APPROVED",
};

export const SUPERUSER_ROLES = [Roles.ADMIN, Roles.OWNER];

export const GENERAL_CONTROL = [
  ControlPanelID.SIGNUP_STATE,
  ControlPanelID.ACTIVITY_CHECK_STATE,
  ControlPanelID.LEAGUE_STATE,

  ControlPanelID.SEASON,
  ControlPanelID.MAP_POOL,
  ControlPanelID.WELCOME_MESSAGE,
];

export const MMR_CONTROL = [
  ControlPanelID.MMR_DISPLAY_STATE,

  ControlPanelID.PROSPECT_MMR_CAP_PLAYER,
  ControlPanelID.APPRENTICE_MMR_CAP_PLAYER,
  ControlPanelID.EXPERT_MMR_CAP_PLAYER,

  ControlPanelID.PROSPECT_MMR_CAP_TEAM,
  ControlPanelID.APPRENTICE_MMR_CAP_TEAM,
  ControlPanelID.EXPERT_MMR_CAP_TEAM,
  ControlPanelID.MYTHIC_MMR_CAP_TEAM,
];

export const DRAFT_CONTROL = [
  ControlPanelID.DRAFT_TRADES_OPEN,
  ControlPanelID.OFFLINE_DRAFT_OPEN,
];

export const BAN_CONTROL = [
  ControlPanelID.BO2_BAN_ORDER,
  ControlPanelID.BO3_BAN_ORDER,
  ControlPanelID.BO5_BAN_ORDER,
];

export const CONTROL_GROUPS: Record<string, Set<number>> = {
  general: new Set(GENERAL_CONTROL),
  mmr: new Set(MMR_CONTROL),
  draft: new Set(DRAFT_CONTROL),
  ban: new Set(BAN_CONTROL),
};
