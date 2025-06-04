import StatsPanel from "@/components/stats/StatsPanel";
import StatsTitle from "@/components/stats/StatsTitle";
import ListBox from "@/components/tabs/DropDown";
import HorizontalTab, { TTabElements } from "@/components/tabs/HorizontalTab";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { listAllSeasons } from "@/lib/common/utils";
import { GameType, Tier } from "@prisma/client";
import { Suspense } from "react";

export default async function Page() {
  const currentSeason = await getSeasonCached();
  const listOfAllSeasons = listAllSeasons(currentSeason);
  const seasonList = listOfAllSeasons.map((season) => ({
    query: season,
    name: `SEASON ${season}`,
  }));
  const gameTypes = [GameType.SEASON, GameType.PRE_SEASON, GameType.COMBINE];
  const gameTypeList = gameTypes.map((game) => ({
    query: game.toLocaleLowerCase(),
    name: `${game.replace("_", "")} STATS`,
  }));

  const defaultQueries = {
    season: currentSeason,
    tier: Tier.MYTHIC,
  };
  const tabs: TTabElements[] = TIERS_LIST.map((tier) => ({
    name: tier,
    query: tier,
    color: TIER_COLOR_MAP[tier],
    content: <StatsPanel defaultQueries={defaultQueries} />,
  }));

  return (
    <div className="mx-auto py-10 xl:py-12 flex flex-col gap-1 xl:gap-2">
      <Suspense>
        <StatsTitle defaultQueries={defaultQueries} />
      </Suspense>
      <div className="flex flex-row gap-2 px-5 sm:px-0 py-1 xl:py-0">
        <div className="w-full">
          <Suspense>
            <ListBox params={"season"} menuElements={seasonList} />
          </Suspense>
        </div>
        <div className="w-full">
          <Suspense>
            <ListBox params={"type"} menuElements={gameTypeList} />
          </Suspense>
        </div>
      </div>
      <div>
        <Suspense>
          <HorizontalTab tabElements={tabs} params="tier" />
        </Suspense>
      </div>
    </div>
  );
}
