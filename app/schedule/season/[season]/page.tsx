import SchedulePanelSkeleton from "@/components/schedule/SchedulePanelSkeleton";
import SchedulePanelLoader from "@/components/schedule/SchedulePanelLoader";
import VerticalTab from "@/components/tabs/VerticalTab";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ season: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season } = await params;
  return {
    title: `VDC | Season ${season} Match History`,
    description: `Season ${season} Match History`,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ season }, sp, currentSeason] = await Promise.all([
    params,
    searchParams,
    getSeasonCached(),
  ]);
  const seasonNumber = Number(season);
  const activeBy = sp.by as string;
  const tabs: TabElement[] = TIERS_LIST.map((tier) => ({
    query: tier,
    name: tier,
    color: TIER_COLOR_MAP[tier],
    content:
      tier.toLowerCase() === activeBy ? (
        <Suspense fallback={<SchedulePanelSkeleton />}>
          <SchedulePanelLoader tier={tier} season={seasonNumber} />
        </Suspense>
      ) : null,
  }));

  if (seasonNumber === currentSeason) {
    redirect(`/schedule`);
  } else if (seasonNumber > currentSeason) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <div className="py-10 max-w-7xl xl:py-12 flex flex-col gap-10 text-center">
          <h1 className="text-vdcRed text-3xl">
            Unfortunately we are not on season {season} yet!
          </h1>
          <Link href="/schedule">
            <h2 className="text-3xl hover:text-vdcRed">
              Click here for the current season schedule!
            </h2>
          </Link>
        </div>
      </div>
    );
  }

  const validBy = new Set(TIERS_LIST.map((t) => t.toLowerCase()));
  if (typeof sp.by !== "string" || !validBy.has(sp.by)) {
    const defaultBy = TIERS_LIST[0].toLowerCase();
    redirect(`/schedule/season/${season}?by=${defaultBy}`);
  }

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed text-3xl text-center xl:ml-30">
        Season {season} Match History
      </h1>
      <VerticalTab tabElements={tabs} params="by" />
    </div>
  );
}
