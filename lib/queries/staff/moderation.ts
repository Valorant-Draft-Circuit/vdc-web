import { cache } from "react";
import { ModLogType, Prisma } from "@prisma/client";
import { format, formatDistanceToNow } from "date-fns";

import { prisma } from "@/lib/prisma";
import { MOD_TOOLS_EPOCH } from "@/prisma";
import {
  ModLogDisplayType,
  PICKEM_DELETION_PREFIX,
  classifyModLog,
  extractPostMortemUrl,
  isExpiringSoon,
  parseActionedMarker,
  parsePickemDeletionDetails,
  parseSeasonBanMarker,
  stripActionedMarker,
} from "@/lib/common/moderation";

import {
  getIdentitiesByDiscordId,
  identityFor,
  type PlayerIdentity,
} from "./identity";
import { getMapBanStatusByLogId, type MapBanLogStatus } from "./mapBans";

const MOD_LOG_NAMES_INCLUDE = {
  Moderator: { select: { name: true } },
} satisfies Prisma.ModLogsInclude;

type ModLogWithNames = Prisma.ModLogsGetPayload<{
  include: typeof MOD_LOG_NAMES_INCLUDE;
}>;

export type SanctionEntry = PlayerIdentity & {
  logId: number;
  type: ModLogType;
  moderatorName: string;
  message: string;
  dateLabel: string;
  expiresLabel: string | null;
  expiringSoon: boolean;
  postMortemUrl: string | null;
};

function sanctionExpiryLabel(log: ModLogWithNames, now: Date): string | null {
  if (log.expires !== null && log.expires > now) {
    return `expires ${formatDistanceToNow(log.expires, { addSuffix: true })}`;
  }
  const bannedThroughSeason = parseSeasonBanMarker(log.message);
  if (bannedThroughSeason !== null) {
    return `banned through season ${bannedThroughSeason}`;
  }
  return null;
}

function toSanctionEntry(
  log: ModLogWithNames,
  now: Date,
  identity: PlayerIdentity,
): SanctionEntry {
  const hasFutureExpiry = log.expires !== null && log.expires > now;
  return {
    ...identity,
    logId: log.id,
    type: log.type,
    moderatorName: log.Moderator.name ?? "unknown",
    message: log.message,
    postMortemUrl: extractPostMortemUrl(log.message),
    dateLabel: format(log.date, "MMM d, yyyy"),
    expiresLabel: sanctionExpiryLabel(log, now),
    expiringSoon: hasFutureExpiry && isExpiringSoon(log.expires!, now),
  };
}

export const getActiveSanctions = cache(async (): Promise<SanctionEntry[]> => {
  const now = new Date();
  const logs = await prisma.modLogs.findMany({
    where: {
      type: { in: [ModLogType.MUTE, ModLogType.BAN] },
      expires: { gt: now },
      date: { gte: MOD_TOOLS_EPOCH },
    },
    include: MOD_LOG_NAMES_INCLUDE,
    orderBy: { expires: "asc" },
  });

  const identities = await getIdentitiesByDiscordId([
    ...new Set(logs.map((log) => log.discordID)),
  ]);
  return logs.map((log) =>
    toSanctionEntry(log, now, identityFor(identities, log.discordID)),
  );
});

export const getBans = cache(async (): Promise<SanctionEntry[]> => {
  const now = new Date();
  const logs = await prisma.modLogs.findMany({
    where: { type: ModLogType.BAN },
    include: MOD_LOG_NAMES_INCLUDE,
    orderBy: { date: "desc" },
  });

  const identities = await getIdentitiesByDiscordId([
    ...new Set(logs.map((log) => log.discordID)),
  ]);
  return logs.map((log) =>
    toSanctionEntry(log, now, identityFor(identities, log.discordID)),
  );
});

export type PickemDeletionEntry = PlayerIdentity & {
  logId: number;
  groupName: string | null;
  rawMessage: string;
  deletedByName: string;
  dateLabel: string;
  actioned: boolean;
};

export const getPickemDeletionQueue = cache(
  async (): Promise<PickemDeletionEntry[]> => {
    const logs = await prisma.modLogs.findMany({
      where: {
        type: ModLogType.NOTE,
        message: { startsWith: PICKEM_DELETION_PREFIX },
      },
      include: MOD_LOG_NAMES_INCLUDE,
      orderBy: { date: "desc" },
    });

    const identities = await getIdentitiesByDiscordId([
      ...new Set(logs.map((log) => log.discordID)),
    ]);
    return logs.map((log) => {
      const details = parsePickemDeletionDetails(log.message);
      const marker = parseActionedMarker(log.message);
      return {
        ...identityFor(identities, log.discordID),
        logId: log.id,
        groupName: details?.groupName ?? null,
        rawMessage: log.message,
        deletedByName: log.Moderator.name ?? "unknown",
        dateLabel: formatDistanceToNow(log.date, { addSuffix: true }),
        actioned: marker !== null,
      };
    });
  },
);

export type EscalationFilter = ModLogType | "TOTAL";

export type EscalationEntry = PlayerIdentity & {
  discordID: string;
  type: EscalationFilter;
  logCount: number;
};

export const ESCALATION_WARNING_THRESHOLD = 5;

const PICKEM_DELETION_WHERE = {
  type: ModLogType.NOTE,
  message: { startsWith: PICKEM_DELETION_PREFIX },
} satisfies Prisma.ModLogsWhereInput;

const EXCLUDING_PICKEM_DELETIONS = {
  NOT: PICKEM_DELETION_WHERE,
} satisfies Prisma.ModLogsWhereInput;

const ESCALATION_WHERE = {
  type: { not: ModLogType.NOTE },
} satisfies Prisma.ModLogsWhereInput;

export const getEscalationWatch = cache(
  async (): Promise<EscalationEntry[]> => {
    const escalationHaving = {
      discordID: { _count: { gte: ESCALATION_WARNING_THRESHOLD } },
    };
    const [groupedByType, groupedTotals] = await Promise.all([
      prisma.modLogs.groupBy({
        by: ["discordID", "type"],
        where: ESCALATION_WHERE,
        _count: { discordID: true },
        having: escalationHaving,
        orderBy: { _count: { discordID: "desc" } },
      }),
      prisma.modLogs.groupBy({
        by: ["discordID"],
        where: ESCALATION_WHERE,
        _count: { discordID: true },
        having: escalationHaving,
        orderBy: { _count: { discordID: "desc" } },
      }),
    ]);

    const grouped = [
      ...groupedTotals.map((row) => ({
        discordID: row.discordID,
        type: "TOTAL" as const,
        _count: row._count,
      })),
      ...groupedByType.map((row) => ({
        discordID: row.discordID,
        type: row.type as EscalationFilter,
        _count: row._count,
      })),
    ];
    if (grouped.length === 0) return [];

    const identities = await getIdentitiesByDiscordId([
      ...new Set(grouped.map((row) => row.discordID)),
    ]);

    return grouped.map((row) => ({
      ...identityFor(identities, row.discordID),
      discordID: row.discordID,
      type: row.type,
      logCount: row._count.discordID,
    }));
  },
);

export type ModeratorActivityEntry = {
  moderatorName: string;
  total: number;
  countsByType: Partial<Record<ModLogType, number>>;
};

export const getModeratorActivity = cache(
  async (): Promise<ModeratorActivityEntry[]> => {
    const grouped = await prisma.modLogs.groupBy({
      by: ["modID", "type"],
      where: EXCLUDING_PICKEM_DELETIONS,
      _count: { _all: true },
    });
    if (grouped.length === 0) return [];

    const modIds = [...new Set(grouped.map((row) => row.modID))];
    const moderators = await prisma.user.findMany({
      where: { id: { in: modIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map<string, string>();
    for (const moderator of moderators) {
      nameById.set(moderator.id, moderator.name ?? moderator.id);
    }

    const entriesByModId = new Map<string, ModeratorActivityEntry>();
    for (const row of grouped) {
      let entry = entriesByModId.get(row.modID);
      if (!entry) {
        entry = {
          moderatorName: nameById.get(row.modID) ?? row.modID,
          total: 0,
          countsByType: {},
        };
        entriesByModId.set(row.modID, entry);
      }
      entry.total += row._count._all;
      entry.countsByType[row.type] = row._count._all;
    }

    return [...entriesByModId.values()].sort((a, b) => b.total - a.total);
  },
);

export type PlayerHistoryEntry = {
  logId: number;
  type: ModLogDisplayType;
  message: string;
  dateLabel: string;
  moderatorName: string;
  expiresLabel: string | null;
  mapBanLabel: string | null;
};

function mapBanLabelFor(status: MapBanLogStatus | undefined): string | null {
  if (!status) return null;
  if (status.remaining <= 0) return "served";
  const paused = status.frozen ? " (paused)" : "";
  return `${status.remaining} of ${status.mapCount} maps remaining${paused}`;
}

export type PlayerModHistory = {
  playerIgn: string;
  entries: PlayerHistoryEntry[];
};

export const getPlayerModHistory = cache(
  async (ign: string): Promise<PlayerModHistory | null> => {
    const user = await prisma.user.findFirst({
      where: { Accounts: { some: { riotIGN: ign } } },
      select: {
        Accounts: {
          where: { provider: "discord" },
          select: { providerAccountId: true },
        },
      },
    });
    const discordIds =
      user?.Accounts.map((account) => account.providerAccountId) ?? [];
    if (discordIds.length === 0) return null;

    const [logs, mapBanStatuses] = await Promise.all([
      prisma.modLogs.findMany({
        where: { discordID: { in: discordIds } },
        include: { Moderator: { select: { name: true } } },
        orderBy: { date: "desc" },
      }),
      getMapBanStatusByLogId(discordIds),
    ]);

    return {
      playerIgn: ign,
      entries: logs.map((log) => ({
        logId: log.id,
        type: classifyModLog(log.type, log.message),
        message: stripActionedMarker(log.message),
        dateLabel: format(log.date, "MMM d, yyyy"),
        moderatorName: log.Moderator.name ?? "unknown",
        expiresLabel: log.expires
          ? `expires ${format(log.expires, "MMM d, yyyy")}`
          : null,
        mapBanLabel:
          log.type === ModLogType.MAP_BAN
            ? mapBanLabelFor(mapBanStatuses.get(log.id))
            : null,
      })),
    };
  },
);
