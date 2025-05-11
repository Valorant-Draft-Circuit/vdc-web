import SchedulePanelSkeleton from "@/components/schedule/SchedulePanelSkeleton";
import SchedulePanel from "@/components/schedule/SchedulesPanel";
import VerticalTab, { TabElements } from "@/components/tabs/VerticalTab";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ season: number }>;
}) {
  const currentSeason = await getSeasonCached();
  const { season } = await params;
  const seasonNumber = Number(season);
  const tabs: TabElements[] = TIERS_LIST.map((tier) => ({
    tier: tier,
    tabName: tier,
    color: TIER_COLOR_MAP[tier],
    content: <SchedulePanel tier={tier} season={seasonNumber} />,
  }));

  if (seasonNumber === currentSeason) {
    redirect(`/schedule`);
  } else if (season > currentSeason) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="py-10 max-w-7xl xl:py-12 flex flex-col gap-10 text-center">
          <h1 className="text-vdcRed italic text-3xl">
            Unfortunately we are not on season {season} yet!
          </h1>
          <Link href="/schedule">
            <h2 className="italic text-3xl hover:text-vdcRed">
              Click here for the current season schedule!
            </h2>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed italic text-3xl text-center xl:ml-30">
        Season {season} Match History
      </h1>
      <Suspense fallback={<SchedulePanelSkeleton />}>
        <VerticalTab tabElements={tabs} params="by" />
      </Suspense>
    </div>
  );
}
