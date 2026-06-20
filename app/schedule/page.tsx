import SchedulePanelSkeleton from "@/components/schedule/SchedulePanelSkeleton";
import SchedulePanelLoader from "@/components/schedule/SchedulePanelLoader";
import VerticalTab from "@/components/tabs/VerticalTab";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
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

  const activeTier = sp.tier as string;
  const tabs: TabElement[] = TIERS_LIST.map((tier) => ({
    name: tier,
    query: tier,
    color: TIER_COLOR_MAP[tier],
    content:
      tier.toLowerCase() === activeTier ? (
        <Suspense fallback={<SchedulePanelSkeleton />}>
          <SchedulePanelLoader tier={tier} season={CURRENT_SEASON} />
        </Suspense>
      ) : null,
  }));

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <VerticalTab tabElements={tabs} params={"tier"} defaultQuery={userTier} />
    </div>
  );
}
