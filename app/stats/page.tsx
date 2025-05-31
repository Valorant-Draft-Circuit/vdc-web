import StatsPanel from "@/components/stats/StatsPanel";
import StatsTitle from "@/components/stats/StatsTitle";
import ListBox from "@/components/tabs/DropDown";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import Soon from "@/components/theme/Soon";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { listAllSeasons } from "@/lib/common/utils";
import { GameType, Tier } from "@prisma/client";

export default async function Page() {
  const currentSeason = await getSeasonCached();
  const listOfAllSeasons = listAllSeasons(currentSeason);
  const seasonList = listOfAllSeasons.map((season) => ({
    query: season,
    name: `SEASON ${season}`,
  }));
  const gameTypes = [GameType.COMBINE, GameType.SEASON];
  const gameTypeList = gameTypes.map((game) => ({
    query: game.toLocaleLowerCase(),
    name: `${game} STATS`,
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

  const wip = false;
  if (wip) {
    return <Soon />;
  }

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-2 xl:gap-10">
      <StatsTitle defaultQueries={defaultQueries} />
      <div className="flex flex-row gap-5 px-5 sm:px-0 py-2 xl:py-0">
        <div className="w-full">
          <ListBox params={"season"} menuElements={seasonList} />
        </div>
        <div className="w-full">
          <ListBox params={"type"} menuElements={gameTypeList} />
        </div>
      </div>
      <div>
        <VerticalTab tabElements={tabs} params="tier" />
      </div>
    </div>
  );
}
