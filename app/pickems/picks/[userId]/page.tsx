import { Metadata } from "next";
import Link from "next/link";
import { type CSSProperties } from "react";
import { Tier } from "@prisma/client";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { getReadonlyPicks } from "@/lib/queries/pickems/getReadonlyPicks";
import { requirePickemsEnabled } from "@/lib/pickems/guard";
import ReadonlyPicks from "@/components/pickems/matches/ReadonlyPicks";
import HubButton from "@/components/pickems/common/HubButton";
import PickemTierTabs from "@/components/pickems/common/PickemTierTabs";
import PlayerAvatar from "@/components/pickems/common/PlayerAvatar";

export const metadata: Metadata = {
  title: "VDC | Pick'ems",
  description: "A player's locked Pick'ems.",
};

type Props = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const TIER_SLUGS = new Set(TIERS_LIST.map((t) => t.toLowerCase()));

const SECTION_PILL_BASE =
  "rounded-full border-[1.5px] border-[var(--tier-accent)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:cursor-pointer";
const SECTION_PILL_ACTIVE = "bg-[var(--tier-accent)] text-white";
const SECTION_PILL_INACTIVE =
  "text-[var(--tier-accent)] hover:bg-[var(--tier-accent)] hover:text-white";

export default async function ReadonlyPicksPage({
  params,
  searchParams,
}: Props) {
  await requirePickemsEnabled();

  const [{ userId }, sp, currentSeason] = await Promise.all([
    params,
    searchParams,
    getSeasonCached(),
  ]);

  const tierParam =
    typeof sp.tier === "string" && TIER_SLUGS.has(sp.tier.toLowerCase())
      ? sp.tier.toLowerCase()
      : "mythic";
  const season =
    typeof sp.season === "string" && !Number.isNaN(Number(sp.season))
      ? Number(sp.season)
      : currentSeason;
  const section = sp.section === "advancement" ? "advancement" : "matches";
  const tier = tierParam.toUpperCase() as Tier;
  const accent = TIER_HEX_COLOR_MAP[tier];
  const basePath = `/pickems/picks/${userId}`;

  const { playerName, playerImage, slates, advance } = await getReadonlyPicks(
    userId,
    tier,
    season,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HubButton />
          <div className="flex items-center gap-2.5">
            <PlayerAvatar
              name={playerName}
              image={playerImage}
              fallbackColor={accent}
              sizeClass="size-9"
              pixels={36}
              textClass="text-[13px]"
            />
            <div>
              <h1 className="text-lg font-bold">{playerName}&apos;s picks</h1>
              <h2 className="text-xs capitalize text-vdcGrey dark:text-gray-400">
                Season {season}
              </h2>
            </div>
          </div>
        </div>
        <Link
          href={`/pickems/leaderboard?view=${tierParam}&season=${season}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-vdcGrey transition-colors hover:cursor-pointer hover:border-vdcGrey hover:text-vdcBlack dark:border-gray-600 dark:text-gray-400 dark:hover:text-vdcWhite"
        >
          <ArrowLeftIcon className="size-4" />
          <h1>Leaderboard</h1>
        </Link>
      </div>

      <PickemTierTabs activeTier={tier} season={season} basePath={basePath} />

      <div
        className="flex gap-1.5"
        style={{ "--tier-accent": accent } as CSSProperties}
      >
        <Link
          href={`${basePath}?tier=${tierParam}&season=${season}&section=matches`}
          className={`${SECTION_PILL_BASE} ${section === "matches" ? SECTION_PILL_ACTIVE : SECTION_PILL_INACTIVE}`}
        >
          <h1>Match Picks</h1>
        </Link>
        <Link
          href={`${basePath}?tier=${tierParam}&season=${season}&section=advancement`}
          className={`${SECTION_PILL_BASE} ${section === "advancement" ? SECTION_PILL_ACTIVE : SECTION_PILL_INACTIVE}`}
        >
          <h1>Advancement Picks</h1>
        </Link>
      </div>

      <ReadonlyPicks
        slates={slates}
        advance={advance}
        accent={accent}
        tier={tierParam}
        section={section}
      />
    </div>
  );
}
