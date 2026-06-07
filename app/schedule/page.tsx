import SchedulePanelSkeleton from "@/components/schedule/SchedulePanelSkeleton";
import SchedulePanel from "@/components/schedule/SchedulesPanel";
import VerticalTab from "@/components/tabs/VerticalTab";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { getUserTier } from "@/lib/queries/user/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const season = await getSeasonCached();
  return {
    title: `VDC | Season ${season} Schedule`,
    description: `Season ${season} Schedule`,
  };
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const [sp, CURRENT_SEASON, userTier] = await Promise.all([
    searchParams,
    getSeasonCached(),
    getUserTier(),
  ]);

  const validTiers = new Set(TIERS_LIST.map((t) => t.toLowerCase()));
  if (typeof sp.tier !== "string" || !validTiers.has(sp.tier)) {
    const defaultTier = (userTier || TIERS_LIST[0]).toLowerCase();
    redirect(`/schedule?tier=${defaultTier}`);
  }

  const tabs: TabElement[] = TIERS_LIST.map((tier) => ({
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