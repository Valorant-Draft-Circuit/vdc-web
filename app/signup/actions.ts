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
  console.log(tiers)
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
  console.log(tier);
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
  console.log(tierGames);

  fetch(`https://numbers.vdc.gg/signup/${accountID}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: accountID,
  });

  revalidatePath("/signup");
  return { ok: true };
}
