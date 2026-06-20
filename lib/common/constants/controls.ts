import { ControlPanelID } from "@/prisma/enums/_controlpanel";

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
  ControlPanelID.DISPLAY_MMR_FM,

  ControlPanelID.RECRUIT_MMR_CAP_PLAYER,
  ControlPanelID.PROSPECT_MMR_CAP_PLAYER,
  ControlPanelID.APPRENTICE_MMR_CAP_PLAYER,
  ControlPanelID.EXPERT_MMR_CAP_PLAYER,

  ControlPanelID.RECRUIT_MMR_CAP_TEAM,
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

export const PICKEM_CONTROL = [
  ControlPanelID.PICKEM_ADVANCE_LOCK,
  ControlPanelID.PICKEM_PREVIEW,
  ControlPanelID.PICKEM_ENABLED,
];

export const CONTROL_GROUPS: Record<string, Set<number>> = {
  general: new Set(GENERAL_CONTROL),
  mmr: new Set(MMR_CONTROL),
  draft: new Set(DRAFT_CONTROL),
  ban: new Set(BAN_CONTROL),
  pickems: new Set(PICKEM_CONTROL),
};
