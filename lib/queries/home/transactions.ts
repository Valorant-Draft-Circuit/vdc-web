import { cache } from "react";
import { Prisma, Tier, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import {
  LEAGUE_TRANSACTION_TYPES,
  ROSTER_TRANSACTION_TYPES,
} from "@/lib/common/constants/transactions";
import { formatRelativeAge } from "@/lib/common/format";

export type TransactionGroupKey = Tier | "LEAGUE";

export type RecentTransactionRow = {
  id: number;
  type: TransactionType;
  stintEnded: boolean;
  label: string;
  playerIgn: string | null;
  teamName: string | null;
  teamLogo: string | null;
  franchiseSlug: string | null;
  dateLabel: string;
};

export type TransactionGroup = {
  key: TransactionGroupKey;
  rows: RecentTransactionRow[];
};

const MAX_ROWS_PER_GROUP = 30;
const RAW_ROWS_FETCH_LIMIT = 60;

const transactionInclude = {
  Player: {
    select: {
      name: true,
      PrimaryRiotAccount: { select: { riotIGN: true } },
    },
  },
  Team: {
    select: {
      name: true,
      Franchise: {
        select: { slug: true, Brand: { select: { logo: true } } },
      },
    },
  },
} as const;

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;

export const getTeamTransactions = cache(
  async (teamId: number, season: number): Promise<RecentTransactionRow[]> => {
    const transactions = await prisma.transaction.findMany({
      where: { season: season, team: teamId },
      include: transactionInclude,
      orderBy: { date: "desc" },
    });
    return mergeStints(transactions);
  },
);

export const getRecentTransactions = cache(
  async (season: number): Promise<TransactionGroup[] | null> => {
    const tierGroupPromises = TIERS_LIST.map(async (tier) => ({
      key: tier,
      rows: await fetchGroupRows(season, ROSTER_TRANSACTION_TYPES, tier),
    }));
    const leagueGroupPromise = (async () => ({
      key: "LEAGUE" as TransactionGroupKey,
      rows: await fetchGroupRows(season, LEAGUE_TRANSACTION_TYPES),
    }))();

    const groups = await Promise.all([...tierGroupPromises, leagueGroupPromise]);
    const hasAnyRows = groups.some((group) => group.rows.length > 0);
    return hasAnyRows ? groups : null;
  },
);

async function fetchGroupRows(
  season: number,
  types: readonly TransactionType[],
  tier?: Tier,
): Promise<RecentTransactionRow[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      season: season,
      type: { in: [...types] },
      ...(tier ? { tier: tier } : {}),
    },
    include: transactionInclude,
    orderBy: { date: "desc" },
    take: RAW_ROWS_FETCH_LIMIT,
  });
  return mergeStints(transactions).slice(0, MAX_ROWS_PER_GROUP);
}

function mergeStints(
  transactions: TransactionWithRelations[],
): RecentTransactionRow[] {
  const pendingCloserCounts = new Map<string, number>();
  const rows: RecentTransactionRow[] = [];

  for (const transaction of transactions) {
    const closedType = stintTypeClosedBy(transaction);
    if (closedType) {
      rows.push(toRow(transaction, closedType, true));
      const key = stintKey(transaction, closedType);
      pendingCloserCounts.set(key, (pendingCloserCounts.get(key) ?? 0) + 1);
      continue;
    }

    const openedType = stintTypeOpenedBy(transaction);
    if (openedType) {
      const key = stintKey(transaction, openedType);
      const pendingClosers = pendingCloserCounts.get(key) ?? 0;
      if (pendingClosers > 0) {
        pendingCloserCounts.set(key, pendingClosers - 1);
        continue;
      }
      rows.push(toRow(transaction, openedType, false));
      continue;
    }

    rows.push(toRow(transaction, transaction.type, false));
  }

  return rows;
}

function stintTypeClosedBy(
  transaction: TransactionWithRelations,
): TransactionType | null {
  if (transaction.type === TransactionType.UNSUB) return TransactionType.SUB;
  if (transaction.type === TransactionType.ACTIVATE) return TransactionType.IR;
  if (
    transaction.type === TransactionType.CAPTAIN &&
    captainMode(transaction.details) === "REMOVE"
  ) {
    return TransactionType.CAPTAIN;
  }
  return null;
}

function stintTypeOpenedBy(
  transaction: TransactionWithRelations,
): TransactionType | null {
  if (transaction.type === TransactionType.SUB) return TransactionType.SUB;
  if (transaction.type === TransactionType.IR) return TransactionType.IR;
  if (transaction.type === TransactionType.CAPTAIN) {
    return TransactionType.CAPTAIN;
  }
  return null;
}

function captainMode(details: string | null): string | null {
  if (!details) return null;
  try {
    const parsed = JSON.parse(details);
    return typeof parsed?.mode === "string" ? parsed.mode : null;
  } catch {
    return null;
  }
}

function stintKey(
  transaction: TransactionWithRelations,
  stintType: TransactionType,
): string {
  return `${stintType}|${transaction.userID}|${transaction.team}`;
}

function toRow(
  transaction: TransactionWithRelations,
  displayType: TransactionType,
  stintEnded: boolean,
): RecentTransactionRow {
  return {
    id: transaction.id,
    type: displayType,
    stintEnded: stintEnded,
    label: rowLabel(transaction),
    playerIgn: transaction.Player?.PrimaryRiotAccount?.riotIGN ?? null,
    teamName: transaction.Team?.name ?? null,
    teamLogo: transaction.Team?.Franchise.Brand?.logo ?? null,
    franchiseSlug: transaction.Team?.Franchise.slug ?? null,
    dateLabel: formatRelativeAge(transaction.date),
  };
}

function rowLabel(transaction: TransactionWithRelations): string {
  if (transaction.type === TransactionType.TRADE) {
    return tradeLabel(transaction.details);
  }
  return (
    transaction.Player?.PrimaryRiotAccount?.riotIGN ??
    transaction.Player?.name ??
    "Unknown"
  );
}

function tradeLabel(details: string | null): string {
  if (!details) return "Trade";
  try {
    const parsed = JSON.parse(details);
    const firstName = parsed?.franchise1?.name;
    const secondName = parsed?.franchise2?.name;
    if (typeof firstName === "string" && typeof secondName === "string") {
      return `${firstName} ⇄ ${secondName}`;
    }
    return "Trade";
  } catch {
    return "Trade";
  }
}
