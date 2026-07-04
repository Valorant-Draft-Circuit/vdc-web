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

// TODO: once PICKEM_GROUP_DELETE is added to the prisma ModLogType enum
// (write it in deleteGroup + backfill old NOTE rows), drop this
// message-prefix classification and read log.type directly.
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

// Format owned by the bot: ModLogs.seasonBanMarker in prisma/_ModLogs.ts
const SEASON_BAN_MARKER_PATTERN = /\[Banned through Season (\d+)\]/;

export function parseSeasonBanMarker(message: string): number | null {
  const match = message.match(SEASON_BAN_MARKER_PATTERN);
  return match ? Number(match[1]) : null;
}

const POST_MORTEM_URL_PATTERN = /https?:\/\/\S*post[-_]?mortems?\S*/i;

export function extractPostMortemUrl(message: string): string | null {
  const match = message.match(POST_MORTEM_URL_PATTERN);
  if (!match) return null;
  return match[0].replace(/[).,>\]]+$/, "");
}
