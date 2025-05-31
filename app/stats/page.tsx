import StatsPanel from "@/components/stats/StatsPanel";
import StatsTitle from "@/components/stats/StatsTitle";
import ListBox from "@/components/tabs/DropDown";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import Soon from "@/components/theme/Soon";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { listAllSeasons } from "@/lib/common/utils";
import { Metadata } from "next";

const CURRENT_SEASON = await getSeasonCached();

export const metadata: Metadata = {
  title: `VDC | Season ${CURRENT_SEASON} Stats`,
  description: `Season ${CURRENT_SEASON} Stats`,
};

export default async function Page() {
  const listOfAllSeasons = listAllSeasons(CURRENT_SEASON);
  const menuElements = listOfAllSeasons.map((season) => ({
    query: season,
    name: season,
  }));

  const tabs: TTabElements[] = TIERS_LIST.map((tier) => ({
    name: tier,
    query: tier,
    color: TIER_COLOR_MAP[tier],
    content: <StatsPanel tier={tier} />,
  }));

  const wip = false;
  if (wip) {
    return <Soon />;
  }

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-2 xl:gap-10">
      <StatsTitle />
      <div className="flex flex-col xl:gap-5 py-2 xl:py-0">
        <ListBox params={"Season"} menuElements={menuElements} />
      </div>
      <div>
        <VerticalTab tabElements={tabs} params="by" />
      </div>
    </div>
  );
}
