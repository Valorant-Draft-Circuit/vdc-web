import { Flags, Player } from "@/prisma";
import { prisma } from "@/lib/prisma";
import { LeagueStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getSignupState } from "@/lib/queries/control/control";

export async function POST(request: NextRequest) {
  const signupState = await getSignupState();
  const rfaOnly = signupState === "RFA_ONLY";
  const req = await request.json();
  if (rfaOnly) {
    req.role = "RFA";
  }
  await prisma.user.update({
    where: {
      id: req.accountID,
    },
    data: {
      Status: {
        update: {
          leagueStatus: LeagueStatus.PENDING,
        },
      },
      primaryRiotAccountID: req.primaryValorantAccount,
    },
  });
  const MMR_ENDPOINT = `https://numbers.vdc.gg/signup/${req.accountID}`;
  const flags: Flags[] = [];
  if (req.role === "RFA") {
    flags.push(Flags.REGISTERED_AS_RFA);
  }
  if (req.playedBefore === "true") {
    flags.push(Flags.ACTIVE_IN_PAST);
  }
  if (req.recentPlayed==="trueFA"){
    flags.push(Flags.ACTIVE_LAST_SEASON);
  }
  await Player.modifyFlags(
    { riotPUUID: req.primaryValorantAccount },
    "ADD",
    flags
  );

  fetch(MMR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: req.accountID,
  });

  return NextResponse.json({
    message: "Player successfully signed up",
    status: 200,
  });
}
