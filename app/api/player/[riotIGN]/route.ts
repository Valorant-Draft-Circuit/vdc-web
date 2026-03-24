import { ControlPanel, Player } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riotIGN: string }> },
) {
  const riotIGN = (await params).riotIGN;
  const shouldIncludeMmr = await ControlPanel.getMMRDisplayState();
  const player = await Player.getBy({ ign: riotIGN });

  const transformAccount = (account) => {
    if (!account) return account;

    if (shouldIncludeMmr) {
      return {
        ...account,
        MMR: account.MMR ? { mmrEffective: account.MMR.mmrEffective } : null,
      };
    }
    // need to omit mmr from info
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { MMR, ...mmrExcludedAccountInfo } = account;
    return mmrExcludedAccountInfo;
  };

  if (!player) {
    return NextResponse.json({ error: "Not Found." }, { status: 404 });
  }

  return NextResponse.json({
    ...player,
    PrimaryRiotAccount: transformAccount(player.PrimaryRiotAccount),
    Accounts: player.Accounts?.map(transformAccount),
  });
}
