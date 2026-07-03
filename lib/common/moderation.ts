import { ModLogType } from "@prisma/client";
import { addHours, format } from "date-fns";

export type ModLogDisplayType = ModLogType | "PICKEM_GROUP_DELETE";

export type PickemDeletionDetails = {
  groupName: string;
  groupId: number;
  groupSeason: number;
};

export type ActionedMarker = {
  modName: string;
  date: string;
};

export const PICKEM_DELETION_PREFIX = "Deleted Pick'ems group";

const DELETION_DETAILS_PATTERN =
  /^Deleted Pick'ems group "(.+)" \(group (\d+), season (\d+)\)\./;
const ACTIONED_MARKER_PATTERN = / \[actioned by (.+) on (\d{4}-\d{2}-\d{2})\]$/;

export function classifyModLog(
  type: ModLogType,
  message: string,
): ModLogDisplayType {
  const isPickemDeletion =
    type === ModLogType.NOTE && message.startsWith(PICKEM_DELETION_PREFIX);
  return isPickemDeletion ? "PICKEM_GROUP_DELETE" : type;
}

export function parsePickemDeletionDetails(
  message: string,
): PickemDeletionDetails | null {
  const match = message.match(DELETION_DETAILS_PATTERN);
  if (!match) return null;
  return {
    groupName: match[1],
    groupId: Number(match[2]),
    groupSeason: Number(match[3]),
  };
}

export function parseActionedMarker(message: string): ActionedMarker | null {
  const match = message.match(ACTIONED_MARKER_PATTERN);
  if (!match) return null;
  return { modName: match[1], date: match[2] };
}

export function appendActionedMarker(
  message: string,
  modName: string,
  date: Date,
): string {
  if (parseActionedMarker(message)) return message;
  const safeModName = modName.replace(/[[\]\n\r]/g, "").trim() || "unknown";
  return `${message} [actioned by ${safeModName} on ${format(date, "yyyy-MM-dd")}]`;
}

export function stripActionedMarker(message: string): string {
  return message.replace(ACTIONED_MARKER_PATTERN, "");
}

export function isExpiringSoon(expires: Date, now: Date): boolean {
  return expires <= addHours(now, 48);
}
