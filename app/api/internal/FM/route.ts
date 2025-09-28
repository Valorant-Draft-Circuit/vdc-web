import { hasAccess } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { getMMRTierLines } from "@/lib/common/utils";
import { getContractsData } from "@/lib/queries/staff/FM";
import { Roles } from "@/prisma";
import { ContractStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }
  const userRoles = session.user?.roles || "";

  if (
    !hasAccess(userRoles, [
      Roles.ADMIN,
      Roles.LEAD_TECH,
      Roles.LEAGUE_AGM,
      Roles.LEAGUE_GM,
    ])
  ) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
  }

  const contracts = await getContractsData();

  const tierlines = await getMMRTierLines();

  const formattedContracts = contracts.map((contract) => {
    console.log(contract);
    const formattedContract = {
      discord: contract.name,
      name: contract.PrimaryRiotAccount?.riotIGN,
      leagueStatus: contract.Status?.leagueStatus,
      contractStatus: contract.Status?.contractStatus as
        | string
        | ContractStatus
        | null
        | undefined,
      contractRemaining: contract.Status?.contractRemaining,
      mmr: contract.PrimaryRiotAccount?.MMR?.mmrEffective,
      tier:
        (contract.PrimaryRiotAccount?.MMR?.mmrEffective ?? -1) <
        tierlines.RECRUIT.max
          ? "RECRUIT"
          : (contract.PrimaryRiotAccount?.MMR?.mmrEffective ?? -1) <
            tierlines.PROSPECT.max
          ? "PROSPECT"
          : (contract.PrimaryRiotAccount?.MMR?.mmrEffective ?? -1) <
            tierlines.APPRENTICE.max
          ? "APPRENTICE"
          : (contract.PrimaryRiotAccount?.MMR?.mmrEffective ?? -1) <
            tierlines.EXPERT.max
          ? "EXPERT"
          : (contract.PrimaryRiotAccount?.MMR?.mmrEffective ?? -1) <
            tierlines.MYTHIC.max
          ? "MYTHIC"
          : "N/A",
      team: undefined as string | undefined,
      franchise: undefined as string | undefined,
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

  return NextResponse.json(formattedContracts);
}
