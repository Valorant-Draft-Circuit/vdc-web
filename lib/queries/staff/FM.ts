import { getMmmrTierLinesCached, getSeasonCached } from "@/lib/common/cache";
import { ControlPanel } from "@/prisma";
import {
  ContractStatus,
  LeagueStatus,
  Tier,
  TransactionType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { formatPlainDate } from "@/lib/common/format";

export type FormattedContract = {
  discord: string | null;
  name: string | null | undefined;
  leagueStatus: string | null | undefined;
  contractStatus: string | ContractStatus | null | undefined;
  contractRemaining: number | null | undefined;
  mmr: number | null | undefined;
  tier: string | undefined;
  team: string | undefined;
  franchise: string | undefined;
};

export async function getContractsData() {
  const contracts = await prisma.user.findMany({
    where: {
      OR: [
        {
          Status: {
            contractStatus: { not: null },
          },
        },
        {
          Status: {
            leagueStatus: {
              in: [
                LeagueStatus.FREE_AGENT,
                LeagueStatus.DRAFT_ELIGIBLE,
                LeagueStatus.RESTRICTED_FREE_AGENT,
                LeagueStatus.GENERAL_MANAGER,
              ],
            },
          },
        },
      ],
    },
    include: {
      Status: true,
      Team: {
        include: {
          Franchise: true,
        },
      },
      PrimaryRiotAccount: {
        include: {
          MMR: true,
        },
      },
    },
  });
  return contracts;
}

export async function getFormattedContracts(): Promise<FormattedContract[]> {
  const [contracts, tierlines, FMAccess] = await Promise.all([
    getContractsData(),
    getMmmrTierLinesCached(),
    ControlPanel.getDisplayMMRFM(),
  ]);

  return contracts.map((contract) => {
    const mmr = contract.PrimaryRiotAccount?.MMR?.mmrEffective;
    const formattedContract: FormattedContract = {
      discord: contract.name,
      name: contract.PrimaryRiotAccount?.riotIGN,
      leagueStatus: contract.Status?.leagueStatus,
      contractStatus: contract.Status?.contractStatus,
      contractRemaining: contract.Status?.contractRemaining,
      mmr: FMAccess ? mmr : undefined,
      tier: FMAccess ? derivedTier(mmr, tierlines) : undefined,
      team: undefined,
      franchise: undefined,
    };

    if (!contract.Status || contract.Status.contractStatus === null) {
      formattedContract.team = "N/A";
      formattedContract.franchise = "N/A";
      formattedContract.contractStatus = "N/A";
    } else {
      formattedContract.team = contract.Team?.name ?? "N/A";
      formattedContract.franchise = contract.Team?.Franchise?.name ?? "N/A";
    }
    return formattedContract;
  });
}

type Tierlines = Awaited<ReturnType<typeof getMmmrTierLinesCached>>;

function derivedTier(
  mmr: number | null | undefined,
  tierlines: Tierlines,
): string {
  const value = mmr ?? -1;
  if (value <= tierlines.RECRUIT.max) return "RECRUIT";
  if (value <= tierlines.PROSPECT.max) return "PROSPECT";
  if (value <= tierlines.APPRENTICE.max) return "APPRENTICE";
  if (value <= tierlines.EXPERT.max) return "EXPERT";
  if (value <= tierlines.MYTHIC.max) return "MYTHIC";
  return "N/A";
}

export type ActiveSub = {
  userID: string;
  name: string;
  playerIgn: string | null;
  tier: Tier;
  teamName: string;
  teamLogo: string | null;
  franchiseSlug: string | null;
  sinceLabel: string | null;
};

export const getActiveSubs = cache(async (): Promise<ActiveSub[]> => {
  const subbedUsers = await prisma.user.findMany({
    where: { Status: { contractStatus: ContractStatus.ACTIVE_SUB } },
    select: {
      id: true,
      name: true,
      PrimaryRiotAccount: { select: { riotIGN: true } },
      Team: {
        select: {
          name: true,
          tier: true,
          Franchise: {
            select: { slug: true, Brand: { select: { logo: true } } },
          },
        },
      },
    },
  });
  if (subbedUsers.length === 0) return [];

  const season = await getSeasonCached();
  const subTransactions = await prisma.transaction.findMany({
    where: {
      type: TransactionType.SUB,
      season: season,
      userID: { in: subbedUsers.map((user) => user.id) },
    },
    orderBy: { date: "desc" },
    select: { userID: true, date: true },
  });

  const latestSubDateByUser = new Map<string, Date>();
  for (const subTransaction of subTransactions) {
    if (
      subTransaction.userID &&
      !latestSubDateByUser.has(subTransaction.userID)
    ) {
      latestSubDateByUser.set(subTransaction.userID, subTransaction.date);
    }
  }

  const activeSubs: ActiveSub[] = [];
  for (const user of subbedUsers) {
    if (!user.Team) continue;
    const sinceDate = latestSubDateByUser.get(user.id);
    activeSubs.push({
      userID: user.id,
      name: user.PrimaryRiotAccount?.riotIGN ?? user.name ?? "Unknown",
      playerIgn: user.PrimaryRiotAccount?.riotIGN ?? null,
      tier: user.Team.tier,
      teamName: user.Team.name,
      teamLogo: user.Team.Franchise.Brand?.logo ?? null,
      franchiseSlug: user.Team.Franchise.slug,
      sinceLabel: sinceDate ? formatPlainDate(sinceDate) : null,
    });
  }
  return activeSubs.sort((a, b) => a.name.localeCompare(b.name));
});
