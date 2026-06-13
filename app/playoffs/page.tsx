import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Tier } from "@prisma/client";
import HorizontalTab from "@/components/tabs/HorizontalTab";
import ListBox from "@/components/tabs/DropDown";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { listAllSeasons } from "@/lib/common/season";
import { getUserTier } from "@/lib/queries/user/user";
import PlayoffBracket from "@/components/playoffs/PlayoffBracket";
import PlayoffBracketSkeleton from "@/components/playoffs/PlayoffBracketSkeleton";

export async function generateMetadata(): Promise<Metadata> {
  const season = await getSeasonCached();
  return {
    title: `VDC | Season ${season} Playoffs`,
    description: `Season ${season} playoff brackets.`,
  };
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Playoffs({ searchParams }: Props) {
  const [sp, currentSeason, userTier] = await Promise.all([
    searchParams,
    getSeasonCached(),
    getUserTier(),
  ]);

  const allSeasons = listAllSeasons(currentSeason);
  const validSeasons = new Set(allSeasons);
  const validTiers = new Set(TIERS_LIST.map((t) => t.toLowerCase()));
  const defaultTier = (userTier || Tier.MYTHIC).toLowerCase();

  const seasonOk = typeof sp.season === "string" && validSeasons.has(sp.season);
  const tierOk = typeof sp.tier === "string" && validTiers.has(sp.tier);

  if (!seasonOk || !tierOk) {
    const next = new URLSearchParams();
    next.set("season", seasonOk ? (sp.season as string) : currentSeason.toString());
    next.set("tier", tierOk ? (sp.tier as string) : defaultTier);
    redirect(`/playoffs?${next.toString()}`);
  }

  const seasonNumber = Number(sp.season);
  const activeTier = sp.tier as string;

  const seasonList = allSeasons.map((season) => ({
    query: season,
    name: `SEASON ${season}`,
  }));

  const tabs: TabElement[] = TIERS_LIST.map((tier) => ({
    name: tier,
    query: tier,
    color: TIER_COLOR_MAP[tier],
    content:
      tier.toLowerCase() === activeTier ? (
        <Suspense fallback={<PlayoffBracketSkeleton />}>
          <PlayoffBracket tier={tier} season={seasonNumber} />
        </Suspense>
      ) : null,
  }));

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-6">
      <h1 className="text-vdcRed text-3xl text-center">
        Season {seasonNumber} Playoffs
      </h1>
      <div className="px-5 sm:px-0 max-w-xs">
        <ListBox
          params="season"
          menuElements={seasonList}
          defaultDropDownQuery={currentSeason.toString()}
        />
      </div>
      <HorizontalTab tabElements={tabs} params="tier" defaultQuery={userTier ?? undefined} />
    </div>
  );
}
