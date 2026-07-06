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
  ControlPanelID.PICKEM_BRACKET_LOCK,
  ControlPanelID.PICKEM_PREVIEW,
  ControlPanelID.PICKEM_ENABLED,
];

export const QueuebotControlID = {
  QUEUE_ENABLED: 36,
  QUEUE_HEALTH_CHECK_INTERVAL_MS: 37,
  QUEUE_HEALTH_DB_TIMEOUT_MS: 38,
  QUEUE_MAX_SCAN_PER_BUCKET: 39,
  QUEUE_NEW_PLAYER_GAME_REQ: 40,
  QUEUE_RETURNING_GAME_REQ: 41,
  QUEUE_CHANNEL_STOP_THRESHOLD: 42,
} as const;

export const QUEUEBOT_CONTROL = [
  QueuebotControlID.QUEUE_ENABLED,
  QueuebotControlID.QUEUE_HEALTH_CHECK_INTERVAL_MS,
  QueuebotControlID.QUEUE_HEALTH_DB_TIMEOUT_MS,
  QueuebotControlID.QUEUE_MAX_SCAN_PER_BUCKET,
  QueuebotControlID.QUEUE_NEW_PLAYER_GAME_REQ,
  QueuebotControlID.QUEUE_RETURNING_GAME_REQ,
  QueuebotControlID.QUEUE_CHANNEL_STOP_THRESHOLD,
];

export const CONTROL_GROUPS: Record<string, readonly number[]> = {
  general: GENERAL_CONTROL,
  mmr: MMR_CONTROL,
  draft: DRAFT_CONTROL,
  ban: BAN_CONTROL,
  pickems: PICKEM_CONTROL,
  queuebot: QUEUEBOT_CONTROL,
};
