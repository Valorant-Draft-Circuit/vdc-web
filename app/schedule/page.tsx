import SchedulePanel from "@/components/schedule/SchedulesPanel";
import TabSelector, { TabElements } from "@/components/tabs/TabSelector";
import { getSeasonCached } from "@/lib/common/cache";
import { Tier } from "@prisma/client";
import { Suspense } from "react";

const tabs: TabElements[] = [
  {
    tier: Tier.MYTHIC,
    color: "vdcPurple",
    content: <SchedulePanel tier={Tier.MYTHIC} />,
  },
  {
    tier: Tier.EXPERT,
    color: "vdcBlue",
    content: <SchedulePanel tier={Tier.EXPERT} />,
  },
  {
    tier: Tier.APPRENTICE,
    color: "vdcGreen",
    content: <SchedulePanel tier={Tier.APPRENTICE} />,
  },
  {
    tier: Tier.PROSPECT,
    color: "vdcYellow",
    content: <SchedulePanel tier={Tier.PROSPECT} />,
  },
];

export default function Page() {
  const currentSeason = getSeasonCached();
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed italic text-3xl text-center xl:ml-30">
        Season {currentSeason} Schedule
      </h1>
      <Suspense fallback={<div>Loading schedule…</div>}>
        <TabSelector tabElements={tabs} />
      </Suspense>
    </div>
  );
}
