import { getMmmrTierLinesCached, getSeasonCached } from "@/lib/common/cache";
import { ControlPanel } from "@/prisma";
import {
  ContractStatus,
  GameType,
  LeagueStatus,
  Tier,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import { deriveTeamIdFromStats } from "@/lib/common/player";

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

export type SubbedTeam = {
  name: string;
  logo: string | null;
  franchiseSlug: string;
};

export type SubUsageRow = {
  userID: string;
  name: string;
  playerIgn: string | null;
  isCurrentlySubbed: boolean;
  matchDayLabels: string[];
  teams: SubbedTeam[];
};

export type TierSubUsage = {
  tier: Tier;
  subs: SubUsageRow[];
};

type SubUsageAccumulator = {
  userID: string;
  name: string;
  playerIgn: string | null;
  isCurrentlySubbed: boolean;
  matchDays: Set<number>;
  teamsById: Map<number, SubbedTeam>;
};

export const getSeasonSubUsage = cache(async (): Promise<TierSubUsage[]> => {
  const season = await getSeasonCached();
  const seasonStats = await prisma.playerStats.findMany({
    where: { Game: { season: season, gameType: GameType.SEASON } },
    select: {
      userID: true,
      team: true,
      Player: {
        select: {
          team: true,
          name: true,
          PrimaryRiotAccount: { select: { riotIGN: true } },
          Status: { select: { contractStatus: true } },
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
      Game: {
        select: { tier: true, Match: { select: { matchDay: true } } },
      },
    },
  });

  const statsByUser = new Map<string, typeof seasonStats>();
  for (const stat of seasonStats) {
    const userStats = statsByUser.get(stat.userID) ?? [];
    userStats.push(stat);
    statsByUser.set(stat.userID, userStats);
  }

  const usageByTier = new Map<Tier, Map<string, SubUsageAccumulator>>();

  for (const userStats of statsByUser.values()) {
    const rosterTeamIds = new Set<number>();
    const currentTeamId = userStats[0].Player.team;
    if (currentTeamId !== null) rosterTeamIds.add(currentTeamId);
    const pluralityTeamId = deriveTeamIdFromStats(userStats);
    if (pluralityTeamId !== null) rosterTeamIds.add(pluralityTeamId);

    for (const stat of userStats) {
      const statTeamId = stat.team;
      const matchDay = stat.Game.Match?.matchDay;
      if (statTeamId === null || rosterTeamIds.has(statTeamId)) continue;
      if (!stat.Team || matchDay == null) continue;

      const tierUsage =
        usageByTier.get(stat.Game.tier) ??
        new Map<string, SubUsageAccumulator>();
      usageByTier.set(stat.Game.tier, tierUsage);

      const accumulator = tierUsage.get(stat.userID) ?? {
        userID: stat.userID,
        name:
          stat.Player.PrimaryRiotAccount?.riotIGN ??
          stat.Player.name ??
          "Unknown",
        playerIgn: stat.Player.PrimaryRiotAccount?.riotIGN ?? null,
        isCurrentlySubbed:
          stat.Player.Status?.contractStatus === ContractStatus.ACTIVE_SUB,
        matchDays: new Set<number>(),
        teamsById: new Map<number, SubbedTeam>(),
      };
      tierUsage.set(stat.userID, accumulator);

      accumulator.matchDays.add(matchDay);
      accumulator.teamsById.set(statTeamId, {
        name: stat.Team.name,
        logo: stat.Team.Franchise.Brand?.logo ?? null,
        franchiseSlug: stat.Team.Franchise.slug,
      });
    }
  }

  const tierSubUsage: TierSubUsage[] = [];
  for (const tier of TIERS_LIST) {
    const tierUsage = usageByTier.get(tier);
    if (!tierUsage) continue;
    const subs = [...tierUsage.values()]
      .map(toSubUsageRow)
      .sort(bySubbedInThenUsage);
    tierSubUsage.push({ tier, subs });
  }
  return tierSubUsage;
});

function toSubUsageRow(accumulator: SubUsageAccumulator): SubUsageRow {
  const matchDayLabels = [...accumulator.matchDays]
    .sort((first, second) => first - second)
    .map((matchDay) => `MD ${matchDay}`);
  return {
    userID: accumulator.userID,
    name: accumulator.name,
    playerIgn: accumulator.playerIgn,
    isCurrentlySubbed: accumulator.isCurrentlySubbed,
    matchDayLabels: matchDayLabels,
    teams: [...accumulator.teamsById.values()],
  };
}

function bySubbedInThenUsage(first: SubUsageRow, second: SubUsageRow) {
  if (first.isCurrentlySubbed !== second.isCurrentlySubbed) {
    return first.isCurrentlySubbed ? -1 : 1;
  }
  const countDifference =
    second.matchDayLabels.length - first.matchDayLabels.length;
  if (countDifference !== 0) return countDifference;
  return first.name.localeCompare(second.name);
}
