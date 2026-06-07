"use server";

import { revalidatePath } from "next/cache";
import { LeagueStatus } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Flags, Player } from "@/prisma";
import { getSignupState } from "@/lib/queries/control/control";
import type { SignUpInput } from "./SignUpForm";

type SignUpResult = { ok: true } | { ok: false; error: string };

export async function signupAction(input: SignUpInput): Promise<SignUpResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const accountID = session.user.id;
  const signupState = await getSignupState();
  if (signupState === "CLOSED") {
    return { ok: false, error: "Signups are closed" };
  }
  const role = signupState === "RFA_ONLY" ? "RFA" : input.role;

  await prisma.user.update({
    where: { id: accountID },
    data: {
      Status: {
        update: { leagueStatus: LeagueStatus.PENDING },
      },
      primaryRiotAccountID: input.primaryValorantAccount,
    },
  });

  const flags: Flags[] = [];
  if (role === "RFA") flags.push(Flags.REGISTERED_AS_RFA);
  if (input.playedBefore === "true") flags.push(Flags.ACTIVE_IN_PAST);

  await Player.modifyFlags(
    { riotPUUID: input.primaryValorantAccount },
    "ADD",
    flags
  );

  fetch(`https://numbers.vdc.gg/signup/${accountID}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: accountID,
  });

  revalidatePath("/signup");
  return { ok: true };
}
