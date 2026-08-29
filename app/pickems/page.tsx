import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Tier } from "@prisma/client";
import {
  ChartBarIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/16/solid";

import { auth } from "@/lib/auth/auth";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { VDC_RED } from "@/lib/common/constants/colors";
import { getUserTier } from "@/lib/queries/user/user";
import {
  PICKEM_FIRST_SEASON,
  requirePickemsEnabled,
} from "@/lib/pickems/guard";
import PickemTierTabs from "@/components/pickems/common/PickemTierTabs";
import HubOverviewPanel from "@/components/pickems/hub/HubOverviewPanel";
import HubOverviewSkeleton from "@/components/pickems/hub/HubOverviewSkeleton";

export const metadata: Metadata = {
  title: "VDC | Pick'ems",
  description: "Predict match scores, playoff advancement, and the bracket.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const VALID_TIERS = new Set(TIERS_LIST.map((t) => t.toLowerCase()));
const VALID_TABS = new Set(["overview", ...VALID_TIERS]);

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

  const tabParam = typeof sp.tier === "string" ? sp.tier.toLowerCase() : null;
  const seasonParam = typeof sp.season === "string" ? Number(sp.season) : NaN;
  if (
    !tabParam ||
    !VALID_TABS.has(tabParam) ||
    Number.isNaN(seasonParam) ||
    seasonParam < PICKEM_FIRST_SEASON
  ) {
    const userTierSlug = userTier?.toLowerCase();
    const defaultTab =
      userTierSlug && VALID_TIERS.has(userTierSlug) ? userTierSlug : "overview";
    redirect(`/pickems?tier=${defaultTab}&season=${currentSeason}`);
  }

  const boardTier =
    tabParam === "overview" ? null : (tabParam.toUpperCase() as Tier);
  const season = seasonParam;
  const userId = session?.user?.id ?? null;

  const userTierSlug = userTier?.toLowerCase();
  const fallbackStageTier =
    userTierSlug && VALID_TIERS.has(userTierSlug)
      ? (userTierSlug.toUpperCase() as Tier)
      : Tier.MYTHIC;
  const stageTier = boardTier ?? fallbackStageTier;

  const tabLabel = boardTier ?? "OVERVIEW";
  const accent = boardTier ? TIER_HEX_COLOR_MAP[boardTier] : VDC_RED;

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
            {tabLabel}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/pickems/sentiment?phase=matches&tier=${tabParam === "overview" ? (userTier?.toLowerCase() ?? "mythic") : tabParam}&season=${season}`}
            className={GHOST_PILL}
          >
            <ChartBarIcon className="size-4" />
            <h1>Sentiment</h1>
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

      <PickemTierTabs
        activeTier={boardTier}
        season={season}
        basePath="/pickems"
        includeOverview
      />

      <Suspense
        key={`${tabParam}-${season}`}
        fallback={<HubOverviewSkeleton showTierLeaders={tabParam === "overview"} />}
      >
        <HubOverviewPanel
          stageTier={stageTier}
          season={season}
          userId={userId}
          accent={accent}
          boardTier={boardTier}
        />
      </Suspense>
    </div>
  );
}
