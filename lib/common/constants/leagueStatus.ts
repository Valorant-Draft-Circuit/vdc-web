import { LeagueStatus } from "@prisma/client";

export const STATUS_LABELS: Record<LeagueStatus, string> = {
  [LeagueStatus.GENERAL_MANAGER]: "GM/AGM",
  [LeagueStatus.FREE_AGENT]: "FA",
  [LeagueStatus.RESTRICTED_FREE_AGENT]: "RFA",
  [LeagueStatus.SIGNED]: "SIGNED",
  [LeagueStatus.UNREGISTERED]: "VIEWER",
  [LeagueStatus.DRAFT_ELIGIBLE]: "DE",
  [LeagueStatus.SUSPENDED]: "SUSPENDED",
  [LeagueStatus.RETIRED]: "RETIRED",
  [LeagueStatus.MANUAL_REVIEW]: "MANUAL REVIEW",
  [LeagueStatus.PENDING]: "PENDING",
  [LeagueStatus.APPROVED]: "APPROVED",
};
