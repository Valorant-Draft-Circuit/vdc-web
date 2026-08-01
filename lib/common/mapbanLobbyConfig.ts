export const MAPBAN_LOBBY_FORMATS = ["BO1", "BO3", "BO5"] as const;
export type MapBanLobbyFormat = (typeof MAPBAN_LOBBY_FORMATS)[number];

export const MAPBAN_LOBBY_BAN_ORDERS: Record<MapBanLobbyFormat, string[]> = {
  BO1: [
    "BAN_HOME",
    "BAN_AWAY",
    "BAN_HOME",
    "BAN_AWAY",
    "BAN_HOME",
    "BAN_AWAY",
    "DECIDER",
  ],
  BO3: [
    "BAN_HOME",
    "BAN_AWAY",
    "PICK_HOME",
    "PICK_AWAY",
    "BAN_HOME",
    "BAN_AWAY",
    "DECIDER",
  ],
  BO5: [
    "BAN_HOME",
    "BAN_AWAY",
    "PICK_HOME",
    "PICK_AWAY",
    "PICK_HOME",
    "PICK_AWAY",
    "DECIDER",
  ],
};

export const MAPBAN_LOBBY_SWEEP_INTERVAL_MS = 60 * 1000;
export const MAPBAN_LOBBY_IDLE_MS = 20 * 60 * 1000;
export const MAPBAN_LOBBY_COMPLETE_GRACE_MS = 15 * 60 * 1000;
export const MAPBAN_LOBBY_MAX_AGE_MS = 2 * 60 * 60 * 1000;
export const MAPBAN_LOBBY_GLOBAL_CAP = 200;
export const MAPBAN_LOBBY_PER_USER_CAP = 2;
