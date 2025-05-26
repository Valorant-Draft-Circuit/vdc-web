import { Flags, Player } from "@/prisma";
import { prisma } from "@/prisma/prismadb";
import { LeagueStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const MMR_ENDPOINT = "https://numbers.vdc.gg/player/signup";
  const req = await request.json();

  await prisma.user.update({
    where: {
      id: req.body.accountID,
    },
    data: {
      Status: {
        update: {
          leagueStatus: LeagueStatus.PENDING,
        },
      },
      primaryRiotAccountID: req.body.primaryValorantAccount,
    },
  });

  let flags: Flags[] = [];
  if (req.body.role === "RFA") {
    flags.push(Flags.REGISTERED_AS_RFA);
  }
  if (req.body.playedBefore === "true") {
    flags.push(Flags.ACTIVE_IN_PAST);
  }
  await Player.modifyFlags(
    { riotPUUID: req.body.primaryValorantAccount },
    "ADD",
    flags
  );

  fetch(MMR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: req.body.accountID,
  });

  await prisma.$disconnect();
  return NextResponse.json({
    message: "Player successfully signed up",
    status: 200,
  });
}
