import { ModLogType } from "@prisma/client";

import {
  VDC_BLUE,
  VDC_GREEN,
  VDC_ORANGE,
  VDC_PURPLE,
  VDC_RED,
  VDC_YELLOW,
} from "./colors";
import { ModLogDisplayType } from "@/lib/common/moderation";

export const MOD_LOG_TYPE_ORDER: ModLogType[] = [
  "BAN",
  "MUTE",
  "MAP_BAN",
  "FORMAL_WARNING",
  "INFORMAL_WARNING",
  "NOTE",
];

export const MOD_LOG_TYPE_COLOR_MAP: Record<ModLogDisplayType, string> = {
  NOTE: "bg-gray-400/25 text-gray-600 dark:text-gray-300",
  INFORMAL_WARNING: "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400",
  FORMAL_WARNING: "bg-yellow-400/30 text-yellow-700 dark:text-yellow-300",
  MUTE: "bg-vdcPurple/25 text-vdcPurple",
  BAN: "bg-vdcRed/25 text-vdcRed",
  MAP_BAN: "bg-vdcBlue/25 text-vdcBlue",
  PICKEM_GROUP_DELETE: "bg-vdcGreen/25 text-vdcGreen",
};

export const MOD_LOG_TYPE_HEX_COLOR_MAP: Record<ModLogDisplayType, string> = {
  NOTE: "#94a3b8",
  INFORMAL_WARNING: VDC_ORANGE,
  FORMAL_WARNING: VDC_YELLOW,
  MUTE: VDC_PURPLE,
  BAN: VDC_RED,
  MAP_BAN: VDC_BLUE,
  PICKEM_GROUP_DELETE: VDC_GREEN,
};
