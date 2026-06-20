import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Tier } from "@prisma/client";
import { LockClosedIcon } from "@heroicons/react/16/solid";

import { auth } from "@/lib/auth/auth";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { getUserTier } from "@/lib/queries/user/user";
import { getAdvanceLock } from "@/lib/queries/pickems/getAdvanceBoard";
import { lockCountdown } from "@/lib/pickems/format";
import PickemTierTabs from "@/components/pickems/common/PickemTierTabs";
import AdvanceBoardPanel from "@/components/pickems/advancement/AdvanceBoardPanel";
import AdvancePickerSkeleton from "@/components/pickems/advancement/AdvancePickerSkeleton";
import HubButton from "@/components/pickems/common/HubButton";
import { requirePickemsEnabled } from "@/lib/pickems/guard";

export const metadata: Metadata = {
  title: "VDC | Pick'ems Advancement",
  description: "Predict the teams that make playoffs.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const VALID_TIERS = new Set(TIERS_LIST.map((t) => t.toLowerCase()));

export default async function AdvancementPage({ searchParams }: Props) {
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
    redirect(
      `/pickems/advancement?tier=${defaultTier}&season=${currentSeason}`,
    );
  }

  const tier = tierParam.toUpperCase() as Tier;
  const season = seasonParam;
  const userId = session?.user?.id ?? null;

  const advanceLock = await getAdvanceLock(tier, season);

  const now = new Date();
  const locked = advanceLock === null || advanceLock <= now;
  const accent = TIER_HEX_COLOR_MAP[tier];

  let lockLabel: string;
  if (advanceLock === null) {
    lockLabel = "Window not open";
  } else if (locked) {
    const lockedOn = advanceLock.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    lockLabel = `Locked ${lockedOn}`;
  } else {
    lockLabel = lockCountdown(advanceLock, now);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HubButton
            href={`/pickems?tier=${tier.toLowerCase()}&season=${season}`}
          />
          <h1 className="text-xl font-bold">Playoffs Advancement</h1>
          <h2
            className="rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
            style={{ backgroundColor: accent }}
          >
            {tier}
          </h2>
        </div>
        <h1 className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/5 px-3 py-1.5 text-xs font-normal text-vdcGrey dark:border-white/10 dark:bg-black/25 dark:text-gray-400">
          <LockClosedIcon className="size-3" />
          {lockLabel}
        </h1>
      </div>

      <PickemTierTabs
        activeTier={tier}
        season={season}
        basePath="/pickems/advancement"
      />

      <Suspense
        key={`${tier}-${season}`}
        fallback={<AdvancePickerSkeleton accent={accent} />}
      >
        <AdvanceBoardPanel
          tier={tier}
          season={season}
          userId={userId}
          locked={locked}
          accent={accent}
          canSave={userId !== null}
        />
      </Suspense>
    </div>
  );
}
