import SchedulePanelSkeleton from "@/components/schedule/SchedulePanelSkeleton";
import SchedulePanel from "@/components/schedule/SchedulesPanel";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { getUserTier } from "@/lib/queries/user/user";
import { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const season = await getSeasonCached();
  return {
    title: `VDC | Season ${season} Schedule`,
    description: `Season ${season} Schedule`,
  };
}

export default async function Page() {
  const CURRENT_SEASON = await getSeasonCached();
  const userTier = await getUserTier();

  const tabs: TTabElements[] = TIERS_LIST.map((tier) => ({
    name: tier,
    query: tier,
    color: TIER_COLOR_MAP[tier],
    content: <SchedulePanel tier={tier} season={CURRENT_SEASON} />,
  }));

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <Suspense fallback={<SchedulePanelSkeleton />}>
        <VerticalTab
          tabElements={tabs}
          params={"tier"}
          defaultQuery={userTier}
        />
      </Suspense>
    </div>
  );
}