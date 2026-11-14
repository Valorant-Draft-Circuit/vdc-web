"use server";

import { revalidatePath } from "next/cache";
import { LeagueStatus, MatchType, Tier } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ControlPanel, Flags, Player } from "@/prisma";
import { getSignupState } from "@/lib/queries/control/control";
import type { SignUpInput } from "@/components/signup/SignUpForm";
import { getAllGamesByUser } from "@/lib/queries/games/games";
import { getMatchCount } from "@/lib/queries/match/match";
import { headers } from "next/headers";
import { clientIpFrom, isRateLimited } from "@/lib/common/rateLimit";
import { verifyTurnstileToken } from "@/lib/common/turnstile";

type SignUpResult = { ok: true } | { ok: false; error: string };

export async function signupAction(
  input: SignUpInput,
  captchaToken?: string,
): Promise<SignUpResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const accountID = session.user.id;
  const signupState = await getSignupState();
  if (signupState === "CLOSED") {
    return { ok: false, error: "Signups are closed" };
  }
  if (isRateLimited(`signup:${accountID}`, 5, 10 * 60_000)) {
    return { ok: false, error: "Too many attempts, try again later" };
  }
  if (typeof input?.primaryValorantAccount !== "string") {
    return { ok: false, error: "Select a Riot account" };
  }

  const captchaSecret = process.env.TURNSTILE_SECRET_KEY;
  if (captchaSecret) {
    const ip = clientIpFrom(await headers());
    if (!(await verifyTurnstileToken(captchaSecret, captchaToken, ip))) {
      return { ok: false, error: "Captcha check failed, please try again" };
    }
  } else {
    console.warn("[signup] TURNSTILE_SECRET_KEY is not set; captcha not verified");
  }

  const [status, ownedRiotAccount] = await Promise.all([
    prisma.status.findUnique({
      where: { userID: accountID },
      select: { leagueStatus: true },
    }),
    prisma.account.findFirst({
      where: {
        userId: accountID,
        provider: "riot",
        providerAccountId: input.primaryValorantAccount,
      },
      select: { id: true },
    }),
  ]);
  if (status?.leagueStatus !== LeagueStatus.UNREGISTERED) {
    return { ok: false, error: "You have already signed up" };
  }
  if (!ownedRiotAccount) {
    return { ok: false, error: "That Riot account is not linked to you" };
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
  const season = await ControlPanel.getSeason();

  // new RANKED_BYPASS flag stuff
  const mapsPlayed = await getAllGamesByUser(accountID, season - 1);
  const tiers = {};
  for (let i = 0; i < mapsPlayed.length; i++) {
    const tier = mapsPlayed[i].Game.tier;
    if (Object.keys(tiers).includes(tier)) {
      tiers[tier] += 1;
    } else {
      tiers[tier] = 1;
    }
  }
  const highestValue = Math.max(...Object.values(tiers) as number[]);
  const highestTiers = Object.entries(tiers)
    .filter(([, count]) => count === highestValue)
    .map(([tier]) => tier);
  let tier: Tier  = Tier.RECRUIT;
  if (highestTiers.length > 1) {
    switch (true) {
      case highestTiers.includes(Tier.MYTHIC):
        tier = Tier.MYTHIC;
        break;
      case highestTiers.includes(Tier.LEGEND):
        tier = Tier.LEGEND;
        break;
      case highestTiers.includes(Tier.EXPERT):
        tier = Tier.EXPERT;
        break;
      case highestTiers.includes(Tier.APPRENTICE):
        tier = Tier.APPRENTICE;
        break;
      case highestTiers.includes(Tier.PROSPECT):
        tier = Tier.PROSPECT;
        break;
      case highestTiers.includes(Tier.RECRUIT):
        tier = Tier.RECRUIT;
        break;
    }
  } else {
    tier = highestTiers[0] as Tier;
  }
  const tierGames = await getMatchCount(tier, MatchType.BO2, season-1);
  if (tierGames === null ) {
    return { ok: false, error: "Somehow there was no matches in your tier, make a tech ticket"};
  }
  if (tiers[tier] >= tierGames / 2) {
    await Player.modifyFlags(
    { riotPUUID: input.primaryValorantAccount },
    "ADD",
    [Flags.RANKED_BYPASS],
  );
  }

  fetch(`https://numbers.vdc.gg/signup/${accountID}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: accountID,
  });

  revalidatePath("/signup");
  return { ok: true };
}
