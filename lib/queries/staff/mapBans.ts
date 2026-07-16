import { cache } from "react";
import { MatchType, ModLogType, Prisma, Tier } from "@prisma/client";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { MOD_TOOLS_EPOCH } from "@/prisma";
import { getMmmrTierLinesCached } from "@/lib/common/cache";
import {
  countCompletedMatchDayMaps,
  mapBanTickingSince,
  parseMapBanDetails,
  placeMmrInTierLines,
  remainingMaps,
  type MapBanDetails,
  type TierMatchWithGames,
} from "@/lib/common/mapBans";
import {
  getIdentitiesByDiscordId,
  identityFor,
  type PlayerIdentity,
} from "./identity";

const SERVING_MATCH_TYPES: MatchType[] = [
  MatchType.BO2,
  MatchType.BO3,
  MatchType.BO5,
];

const MAP_BAN_ROW_INCLUDE = {
  Moderator: { select: { name: true } },
} satisfies Prisma.ModLogsInclude;

type MapBanLogRow = Prisma.ModLogsGetPayload<{
  include: typeof MAP_BAN_ROW_INCLUDE;
}>;

type ComputedMapBan = {
  row: MapBanLogRow;
  details: MapBanDetails;
  remaining: number;
};

type PlayerServingInfo = {
  teamId: number | null;
  tier: Tier | null;
};

async function fetchMapBanRows(discordIds?: string[]): Promise<MapBanLogRow[]> {
  return prisma.modLogs.findMany({
    where: {
      type: ModLogType.MAP_BAN,
      date: { gte: MOD_TOOLS_EPOCH },
      ...(discordIds ? { discordID: { in: discordIds } } : {}),
    },
    include: MAP_BAN_ROW_INCLUDE,
    orderBy: { date: "desc" },
  });
}

async function getServingInfoByDiscordId(
  discordIds: string[],
): Promise<Map<string, PlayerServingInfo>> {
  const infoByDiscordId = new Map<string, PlayerServingInfo>();
  if (discordIds.length === 0) return infoByDiscordId;

  const [accounts, tierLines] = await Promise.all([
    prisma.account.findMany({
      where: { providerAccountId: { in: discordIds } },
      select: {
        providerAccountId: true,
        User: {
          select: {
            team: true,
            Team: { select: { tier: true } },
            PrimaryRiotAccount: {
              select: { MMR: { select: { mmrEffective: true } } },
            },
          },
        },
      },
    }),
    getMmmrTierLinesCached(),
  ]);

  for (const account of accounts) {
    const user = account.User;
    const teamTier = user.Team?.tier ?? null;
    const mmrEffective =
      user.PrimaryRiotAccount?.MMR?.mmrEffective ?? null;
    infoByDiscordId.set(account.providerAccountId, {
      teamId: user.team,
      tier: teamTier ?? placeMmrInTierLines(mmrEffective, tierLines),
    });
  }
  return infoByDiscordId;
}

async function countMapsServedForTeam(
  tier: Tier,
  teamId: number,
  since: Date,
): Promise<number> {
  return prisma.games.count({
    where: {
      tier: tier,
      datePlayed: { gt: since },
      Match: {
        matchType: { in: SERVING_MATCH_TYPES },
        OR: [{ home: teamId }, { away: teamId }],
      },
    },
  });
}

const getTierMatchDays = cache(
  async (tier: Tier): Promise<TierMatchWithGames[]> => {
    return prisma.matches.findMany({
      where: { tier: tier, matchType: MatchType.BO2, matchDay: { not: null } },
      select: {
        season: true,
        matchDay: true,
        Games: { select: { datePlayed: true } },
      },
    });
  },
);

async function computeMapBans(rows: MapBanLogRow[]): Promise<ComputedMapBan[]> {
  const carriers = rows.flatMap((row) => {
    const details = parseMapBanDetails(row.details);
    return details ? [{ row, details }] : [];
  });
  if (carriers.length === 0) return [];

  const servingInfo = await getServingInfoByDiscordId([
    ...new Set(carriers.map((carrier) => carrier.row.discordID)),
  ]);

  const computed: ComputedMapBan[] = [];
  for (const { row, details } of carriers) {
    const info = servingInfo.get(row.discordID) ?? {
      teamId: null,
      tier: null,
    };

    let liveServed = 0;
    if (!details.frozen && info.tier !== null) {
      const since = mapBanTickingSince(details, row.date);
      liveServed =
        info.teamId !== null
          ? await countMapsServedForTeam(info.tier, info.teamId, since)
          : countCompletedMatchDayMaps(await getTierMatchDays(info.tier), since);
    }

    computed.push({ row, details, remaining: remainingMaps(details, liveServed) });
  }
  return computed;
}

function splitRulesAndReason(message: string): {
  rulesLine: string;
  reason: string | null;
} {
  const newlineIndex = message.indexOf("\n");
  if (newlineIndex === -1) {
    return { rulesLine: message.trim(), reason: null };
  }
  const rulesLine = message.slice(0, newlineIndex).trim();
  const reason = message.slice(newlineIndex + 1).trim();
  return { rulesLine, reason: reason.length > 0 ? reason : null };
}

export type ActiveMapBanRow = {
  logId: number;
  mapCount: number;
  remaining: number;
  frozen: boolean;
  dateLabel: string;
  moderatorName: string;
  rulesLine: string;
  reason: string | null;
};

export type ActiveMapBanEntry = PlayerIdentity & {
  discordID: string;
  totalRemaining: number;
  paused: boolean;
  bans: ActiveMapBanRow[];
};

export const getActiveMapBans = cache(
  async (): Promise<ActiveMapBanEntry[]> => {
    const computed = await computeMapBans(await fetchMapBanRows());
    const active = computed.filter((ban) => ban.remaining > 0);
    if (active.length === 0) return [];

    const identities = await getIdentitiesByDiscordId([
      ...new Set(active.map((ban) => ban.row.discordID)),
    ]);

    const entriesByDiscordId = new Map<string, ActiveMapBanEntry>();
    for (const ban of active) {
      const { rulesLine, reason } = splitRulesAndReason(ban.row.message);
      const banRow: ActiveMapBanRow = {
        logId: ban.row.id,
        mapCount: ban.details.mapCount,
        remaining: ban.remaining,
        frozen: ban.details.frozen,
        dateLabel: format(ban.row.date, "MMM d, yyyy"),
        moderatorName: ban.row.Moderator.name ?? "unknown",
        rulesLine: rulesLine,
        reason: reason,
      };

      const existing = entriesByDiscordId.get(ban.row.discordID);
      if (existing === undefined) {
        entriesByDiscordId.set(ban.row.discordID, {
          ...identityFor(identities, ban.row.discordID),
          discordID: ban.row.discordID,
          totalRemaining: ban.remaining,
          paused: ban.details.frozen,
          bans: [banRow],
        });
        continue;
      }
      existing.totalRemaining += ban.remaining;
      existing.paused = existing.paused && ban.details.frozen;
      existing.bans.push(banRow);
    }

    return [...entriesByDiscordId.values()].sort(
      (a, b) => b.totalRemaining - a.totalRemaining,
    );
  },
);

export type MapBanLogStatus = {
  mapCount: number;
  remaining: number;
  frozen: boolean;
};

export const getMapBanStatusByLogId = cache(
  async (discordIds: string[]): Promise<Map<number, MapBanLogStatus>> => {
    const statusByLogId = new Map<number, MapBanLogStatus>();
    if (discordIds.length === 0) return statusByLogId;

    const computed = await computeMapBans(await fetchMapBanRows(discordIds));
    for (const ban of computed) {
      statusByLogId.set(ban.row.id, {
        mapCount: ban.details.mapCount,
        remaining: ban.remaining,
        frozen: ban.details.frozen,
      });
    }
    return statusByLogId;
  },
);

export type MapBanNotice = {
  totalRemaining: number;
  paused: boolean;
};

export const getMapBanNoticeByIgn = cache(
  async (ign: string): Promise<MapBanNotice | null> => {
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

    const computed = await computeMapBans(await fetchMapBanRows(discordIds));
    const active = computed.filter((ban) => ban.remaining > 0);
    if (active.length === 0) return null;

    return {
      totalRemaining: active.reduce((sum, ban) => sum + ban.remaining, 0),
      paused: active.every((ban) => ban.details.frozen),
    };
  },
);
