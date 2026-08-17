import StatsPanel from "@/components/stats/StatsPanel";
import StatsTitle from "@/components/stats/StatsTitle";
import ListBox from "@/components/tabs/DropDown";
import HorizontalTab from "@/components/tabs/HorizontalTab";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { listAllSeasons } from "@/lib/common/season";
import { getUserTier } from "@/lib/queries/user/user";
import { ControlPanel } from "@/prisma";
import { GameType, Tier } from "@prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `VDC | Stats`,
  description: `Valorant Draft Circuit player stats page.`,
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const [sp, seasonState, currentSeason, userTier] = await Promise.all([
    searchParams,
    ControlPanel.getLeagueState(),
    getSeasonCached(),
    getUserTier({ isStats: true }),
  ]);

  const gameTypes: GameType[] =
    seasonState === "COMBINES"
      ? [GameType.COMBINE]
      : seasonState === "PLAYOFFS"
        ? [GameType.PLAYOFF, GameType.SEASON, GameType.COMBINE]
        : [GameType.SEASON, GameType.COMBINE];

  const listOfAllSeasons = listAllSeasons(currentSeason);

  const defaultType = gameTypes[0].toLowerCase();
  const defaultTier = (userTier || Tier.MYTHIC).toLowerCase();
  const validTypes = new Set(gameTypes.map((g) => g.toLowerCase()));
  const validTiers = new Set(TIERS_LIST.map((t) => t.toLowerCase()));
  const validSeasons = new Set(listOfAllSeasons);

  const seasonOk = typeof sp.season === "string" && validSeasons.has(sp.season);
  const typeOk = typeof sp.type === "string" && validTypes.has(sp.type);
  const tierOk = typeof sp.tier === "string" && validTiers.has(sp.tier);

  if (!seasonOk || !typeOk || !tierOk) {
    const next = new URLSearchParams();
    next.set(
      "season",
      seasonOk ? (sp.season as string) : currentSeason.toString(),
    );
    next.set("type", typeOk ? (sp.type as string) : defaultType);
    next.set("tier", tierOk ? (sp.tier as string) : defaultTier);
    redirect(`/stats?${next.toString()}`);
  }

  const seasonList = listOfAllSeasons.map((season) => ({
    query: season,
    name: `SEASON ${season}`,
  }));

  const gameTypeList = gameTypes.map((game) => ({
    query: game.toLocaleLowerCase(),
    name: `${game.replace("_", "")}`,
  }));

  const defaultQueries = {
    season: currentSeason,
    tier: userTier || Tier.MYTHIC,
  };

  const seasonNumber = Number(sp.season);
  const gameType = (sp.type as string).toUpperCase() as GameType;
  const activeTier = sp.tier as string;

  const tabs: TabElement[] = TIERS_LIST.map((tier) => ({
    name: tier,
    query: tier,
    color: TIER_COLOR_MAP[tier],
    content:
      tier.toLowerCase() === activeTier ? (
        <Suspense>
          <StatsPanel tier={tier} season={seasonNumber} gameType={gameType} />
        </Suspense>
      ) : null,
  }));

  return (
    <div className="mx-auto py-10 xl:py-12 flex flex-col gap-3">
      <Suspense>
        <StatsTitle defaultQueries={defaultQueries} />
      </Suspense>
      <div className="flex flex-row gap-2 px-5 sm:px-0 py-1 xl:py-0">
        <div className="w-full">
          <Suspense>
            <ListBox
              params={"season"}
              menuElements={seasonList}
              defaultDropDownQuery={currentSeason.toString()}
            />
          </Suspense>
        </div>
        <div className="w-full">
          <Suspense>
            <ListBox
              params={"type"}
              menuElements={gameTypeList}
              defaultDropDownQuery={gameTypes[0].toLowerCase()}
            />
          </Suspense>
        </div>
      </div>
      <div>
        <Suspense>
          <HorizontalTab
            tabElements={tabs}
            params="tier"
            defaultQuery={userTier}
          />
        </Suspense>
      </div>
    </div>
  );
}
