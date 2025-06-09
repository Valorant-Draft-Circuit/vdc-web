import SchedulePanelSkeleton from "@/components/schedule/SchedulePanelSkeleton";
import SchedulePanel from "@/components/schedule/SchedulesPanel";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { Metadata } from "next";
import { Suspense } from "react";

const tabs: TTabElements[] = TIERS_LIST.map((tier) => ({
  name: tier,
  query: tier,
  color: TIER_COLOR_MAP[tier],
  content: <SchedulePanel tier={tier} />,
}));
const CURRENT_SEASON = await getSeasonCached();

export const metadata: Metadata = {
  title: `VDC | Season ${CURRENT_SEASON} Schedule`,
  description: `Season ${CURRENT_SEASON} Schedule`,
};

export default function Page() {
  return (
  <div className="h-screen overflow-hidden flex flex-col">
    <div className="mx-auto py-16 max-w-7xl xl:py-12 flex flex-col gap-12 overflow-hidden">
          <h1 className="text-vdcRed italic text-5xl text-center xl:ml-30">
            Season {CURRENT_SEASON} Schedule
          </h1>
       <div className="flex-1 ">
          <Suspense fallback={<SchedulePanelSkeleton />}>
            <VerticalTab tabElements={tabs} params={"tier"} />
          </Suspense>
        </div>
      </div>
    </div>
    
  );
}
