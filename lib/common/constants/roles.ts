import { Roles } from "@/prisma";
import { VDC_BLUE, VDC_GREEN, VDC_ORANGE, VDC_RED } from "./colors";

export const SUPERUSER_ROLES = [Roles.OWNER, Roles.LEAD_TECH];

export const MODERATION_ROLES = [
  Roles.ADMIN,
  Roles.LEAD_TECH,
  Roles.MODERATOR,
  Roles.LEAD_MODERATOR,
];

export const ROLES = Object.entries(Roles)
  .filter(([key]) => isNaN(Number(key)))
  .map(([label, value]) => ({
    label,
    value: BigInt(value as unknown as string),
  }));

export type RoleName = "DUELIST" | "SENTINEL" | "CONTROLLER" | "INITIATOR";

export const ROLE_ORDER: RoleName[] = [
  "DUELIST",
  "CONTROLLER",
  "SENTINEL",
  "INITIATOR",
];

export const ROLE_COLOR_MAP: Record<RoleName, string> = {
  DUELIST: "vdcRed",
  CONTROLLER: "vdcBlue",
  SENTINEL: "vdcGreen",
  INITIATOR: "vdcOrange",
};

export const ROLE_HEX_COLOR_MAP: Record<RoleName, string> = {
  DUELIST: VDC_RED,
  CONTROLLER: VDC_BLUE,
  SENTINEL: VDC_GREEN,
  INITIATOR: VDC_ORANGE,
};
