import SchedulePanel from "@/components/schedule/SchedulesPanel";
import TabSelector, { TabElements } from "@/components/tabs/TabSelector";
import { getSeasonCached } from "@/lib/common/cache";
import { Tier } from "@prisma/client";
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
  const tabs: TabElements[] = [
    {
      tier: Tier.MYTHIC,
      color: "vdcPurple",
      content: <SchedulePanel tier={Tier.MYTHIC} season={seasonNumber} />,
    },
    {
      tier: Tier.EXPERT,
      color: "vdcBlue",
      content: <SchedulePanel tier={Tier.EXPERT} season={seasonNumber} />,
    },
    {
      tier: Tier.APPRENTICE,
      color: "vdcGreen",
      content: <SchedulePanel tier={Tier.APPRENTICE} season={seasonNumber} />,
    },
    {
      tier: Tier.PROSPECT,
      color: "vdcYellow",
      content: <SchedulePanel tier={Tier.PROSPECT} season={seasonNumber} />,
    },
  ];

  if (seasonNumber === currentSeason) {
    console.log("current season");
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
        Season {season} (past!) Schedule
      </h1>
      <Suspense fallback={<div>Loading schedule…</div>}>
        <TabSelector tabElements={tabs} />
      </Suspense>
    </div>
  );
}
