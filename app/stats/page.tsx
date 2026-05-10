import StatsPanel from "@/components/stats/StatsPanel";
import StatsTitle from "@/components/stats/StatsTitle";
import ListBox from "@/components/tabs/DropDown";
import HorizontalTab, { TTabElements } from "@/components/tabs/HorizontalTab";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { listAllSeasons } from "@/lib/common/utils";
import { getUserTier } from "@/lib/queries/user/user";
import { ControlPanel } from "@/prisma";
import { GameType, Tier } from "@prisma/client";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `VDC | Stats`,
  description: `Valorant Draft Circuit player stats page.`,
};

export default async function Page() {
  const seasonState = await ControlPanel.getLeagueState();
  const gameTypes: GameType[] = [GameType.SEASON, GameType.COMBINE];
  if (seasonState === "COMBINES") {
    gameTypes.reverse();
  }

  const currentSeason = await getSeasonCached();
  const listOfAllSeasons = listAllSeasons(currentSeason);
  const seasonList = listOfAllSeasons.map((season) => ({
    query: season,
    name: `SEASON ${season}`,
  }));

  const gameTypeList = gameTypes.map((game) => ({
    query: game.toLocaleLowerCase(),
    name: `${game.replace("_", "")}`,
  }));

  const userTier = await getUserTier({ isStats: true });

  const defaultQueries = {
    season: currentSeason,
    tier: userTier || Tier.MYTHIC,
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
