import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import { Tier } from "@prisma/client";
import {
  TrophyIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/16/solid";

import { auth } from "@/lib/auth/auth";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { getUserTier } from "@/lib/queries/user/user";
import { requirePickemsEnabled } from "@/lib/pickems/guard";
import PickemTierTabs from "@/components/pickems/common/PickemTierTabs";
import PickemHubBoard from "@/components/pickems/matches/PickemHubBoard";
import PickemHubBoardSkeleton from "@/components/pickems/matches/PickemHubBoardSkeleton";

export const metadata: Metadata = {
  title: "VDC | Pick'ems",
  description: "Predict match scores and playoff advancement.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const VALID_TIERS = new Set(TIERS_LIST.map((t) => t.toLowerCase()));

const GHOST_PILL =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-vdcGrey transition-colors hover:cursor-pointer hover:border-vdcGrey hover:text-vdcBlack dark:border-gray-600 dark:text-gray-400 dark:hover:text-vdcWhite";

export default async function PickemsHub({ searchParams }: Props) {
  await requirePickemsEnabled();

  const [sp, currentSeason, userTier, session] = await Promise.all([
    searchParams,
    getSeasonCached(),
    getUserTier(),
    auth(),
  ]);

  const tierParam = typeof sp.tier === "string" ? sp.tier.toLowerCase() : null;
  const seasonParam = typeof sp.season === "string" ? Number(sp.season) : NaN;
  if (!tierParam || !VALID_TIERS.has(tierParam) || Number.isNaN(seasonParam)) {
    const userTierSlug = userTier?.toLowerCase();
    const defaultTier =
      userTierSlug && VALID_TIERS.has(userTierSlug)
        ? userTierSlug
        : Tier.MYTHIC.toLowerCase();
    redirect(`/pickems?tier=${defaultTier}&season=${currentSeason}`);
  }

  const tier = tierParam.toUpperCase() as Tier;
  const season = seasonParam;
  const userId = session?.user?.id ?? null;
  const accent = TIER_HEX_COLOR_MAP[tier];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-wide">
            PICK<b className="text-vdcRed">&apos;</b>EMS
          </h1>
          <h2
            className="rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
            style={{ backgroundColor: accent }}
          >
            {tier}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/pickems/advancement?tier=${tier.toLowerCase()}&season=${season}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-[var(--tier-accent)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--tier-accent)] transition-colors hover:cursor-pointer hover:bg-[var(--tier-accent)] hover:text-white"
            style={{ "--tier-accent": accent } as CSSProperties}
          >
            <TrophyIcon className="size-4" />
            <h1>Advancement Picks</h1>
          </Link>
          <Link
            href={`/pickems/leaderboard?season=${season}`}
            className={GHOST_PILL}
          >
            <ChartBarIcon className="size-4" />
            <h1>Leaderboard</h1>
          </Link>
          <Link href="/pickems/groups" className={GHOST_PILL}>
            <UserGroupIcon className="size-4" />
            <h1>Groups</h1>
          </Link>
          <Link href="/pickems/about" className={GHOST_PILL}>
            <QuestionMarkCircleIcon className="size-4" />
            <h1>How to play</h1>
          </Link>
        </div>
      </div>

      <PickemTierTabs activeTier={tier} season={season} basePath="/pickems" />

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
