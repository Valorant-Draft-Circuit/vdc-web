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
  label: string;
  playerIgn: string | null;
  teamName: string | null;
  teamLogo: string | null;
  dateLabel: string;
};

export type TransactionGroup = {
  key: TransactionGroupKey;
  rows: RecentTransactionRow[];
};

const MAX_ROWS_PER_GROUP = 30;

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
      Franchise: { select: { Brand: { select: { logo: true } } } },
    },
  },
} as const;

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: typeof transactionInclude;
}>;

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
    take: MAX_ROWS_PER_GROUP,
  });
  return transactions.map(toRow);
}

function toRow(transaction: TransactionWithRelations): RecentTransactionRow {
  return {
    id: transaction.id,
    type: transaction.type,
    label: rowLabel(transaction),
    playerIgn: transaction.Player?.PrimaryRiotAccount?.riotIGN ?? null,
    teamName: transaction.Team?.name ?? null,
    teamLogo: transaction.Team?.Franchise.Brand?.logo ?? null,
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
