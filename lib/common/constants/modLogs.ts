import { ModLogType } from "@prisma/client";

import { VDC_ORANGE, VDC_PURPLE, VDC_RED, VDC_YELLOW } from "./colors";

export const MOD_LOG_TYPE_ORDER: ModLogType[] = [
  "BAN",
  "MUTE",
  "FORMAL_WARNING",
  "INFORMAL_WARNING",
  "NOTE",
];

export const MOD_LOG_TYPE_COLOR_MAP: Record<ModLogType, string> = {
  NOTE: "bg-gray-400/25 text-gray-600 dark:text-gray-300",
  INFORMAL_WARNING: "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400",
  FORMAL_WARNING: "bg-yellow-400/30 text-yellow-700 dark:text-yellow-300",
  MUTE: "bg-vdcPurple/25 text-vdcPurple",
  BAN: "bg-vdcRed/25 text-vdcRed",
};

export const MOD_LOG_TYPE_HEX_COLOR_MAP: Record<ModLogType, string> = {
  NOTE: "#94a3b8",
  INFORMAL_WARNING: VDC_ORANGE,
  FORMAL_WARNING: VDC_YELLOW,
  MUTE: VDC_PURPLE,
  BAN: VDC_RED,
};
