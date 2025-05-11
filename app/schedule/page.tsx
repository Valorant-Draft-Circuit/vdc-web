import SchedulePanelSkeleton from "@/components/schedule/SchedulePanelSkeleton";
import SchedulePanel from "@/components/schedule/SchedulesPanel";
import VerticalTab, { TabElements } from "@/components/tabs/VerticalTab";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { Suspense } from "react";

const tabs: TabElements[] = TIERS_LIST.map((tier) => ({
  tier: tier,
  tabName: tier,
  color: TIER_COLOR_MAP[tier],
  content: <SchedulePanel tier={tier} />,
}));

export default function Page() {
  const currentSeason = getSeasonCached();
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed italic text-3xl text-center xl:ml-30">
        Season {currentSeason} Schedule
      </h1>
      <Suspense fallback={<SchedulePanelSkeleton />}>
        <VerticalTab tabElements={tabs} params="by" />
      </Suspense>
    </div>
  );
}
