import { getMmmrTierLinesCached } from "@/lib/common/cache";
import { ControlPanel } from "@/prisma";
import { ContractStatus, LeagueStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
