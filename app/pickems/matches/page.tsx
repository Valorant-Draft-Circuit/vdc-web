import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Tier } from "@prisma/client";

import { auth } from "@/lib/auth/auth";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { getUserTier } from "@/lib/queries/user/user";
import {
  PICKEM_FIRST_SEASON,
  requirePickemsEnabled,
} from "@/lib/pickems/guard";
import PickemTierTabs from "@/components/pickems/common/PickemTierTabs";
import PickemHubBoard from "@/components/pickems/matches/PickemHubBoard";
import PickemHubBoardSkeleton from "@/components/pickems/matches/PickemHubBoardSkeleton";
import HubButton from "@/components/pickems/common/HubButton";

export const metadata: Metadata = {
  title: "VDC | Pick'ems Matches",
  description: "Predict match scores per match day.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const VALID_TIERS = new Set(TIERS_LIST.map((t) => t.toLowerCase()));

export default async function MatchPicksPage({ searchParams }: Props) {
  await requirePickemsEnabled();

  const [sp, currentSeason, userTier, session] = await Promise.all([
    searchParams,
    getSeasonCached(),
    getUserTier(),
    auth(),
  ]);

  const tierParam = typeof sp.tier === "string" ? sp.tier.toLowerCase() : null;
  const seasonParam = typeof sp.season === "string" ? Number(sp.season) : NaN;
  if (
    !tierParam ||
    !VALID_TIERS.has(tierParam) ||
    Number.isNaN(seasonParam) ||
    seasonParam < PICKEM_FIRST_SEASON
  ) {
    const userTierSlug = userTier?.toLowerCase();
    const defaultTier =
      userTierSlug && VALID_TIERS.has(userTierSlug)
        ? userTierSlug
        : Tier.MYTHIC.toLowerCase();
    redirect(`/pickems/matches?tier=${defaultTier}&season=${currentSeason}`);
  }

  const tier = tierParam.toUpperCase() as Tier;
  const season = seasonParam;
  const userId = session?.user?.id ?? null;
  const accent = TIER_HEX_COLOR_MAP[tier];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HubButton
            href={`/pickems?tier=${tier.toLowerCase()}&season=${season}`}
          />
          <h1 className="text-xl font-bold">Match Picks</h1>
          <h2
            className="rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
            style={{ backgroundColor: accent }}
          >
            {tier}
          </h2>
        </div>
      </div>

      <PickemTierTabs
        activeTier={tier}
        season={season}
        basePath="/pickems/matches"
      />

      <Suspense key={`${tier}-${season}`} fallback={<PickemHubBoardSkeleton />}>
        <PickemHubBoard
          tier={tier}
          season={season}
          userId={userId}
          accent={accent}
        />
      </Suspense>
    </div>
  );
}
