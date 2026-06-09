import StandingsPanel from "@/components/standings/StandingsPanel";
import VerticalTab from "@/components/tabs/VerticalTab";
import { TabElement } from "@/components/tabs/types";
import React, { Suspense } from "react";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import StandingsPanelSkeleton from "@/components/standings/StandingsPanelSkeleton";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserTier } from "@/lib/queries/user/user";

export async function generateMetadata(): Promise<Metadata> {
  const season = await getSeasonCached();
  return {
    title: `VDC | Season ${season} Standings`,
    description: `Season ${season} Standings`,
  };
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Standings({ searchParams }: Props) {
  const [sp, CURRENT_SEASON, userTier] = await Promise.all([
    searchParams,
    getSeasonCached(),
    getUserTier(),
  ]);

  const validBy = new Set([
    "franchises",
    ...TIERS_LIST.map((t) => t.toLowerCase()),
  ]);
  if (typeof sp.by !== "string" || !validBy.has(sp.by)) {
    const defaultBy = (userTier || "franchises").toLowerCase();
    redirect(`/standings?by=${defaultBy}`);
  }

  const tabs: TabElement[] = TIERS_LIST.map((tier) => ({
    query: tier,
    name: tier,
    color: TIER_COLOR_MAP[tier],
    content: <StandingsPanel query={tier} />,
  }));
  tabs.unshift({
    name: "franchises",
    query: "franchises",
    color: "vdcRed",
    content: <StandingsPanel query="franchises" />,
  });

  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed text-3xl text-center xl:ml-30">
        Season {CURRENT_SEASON} Standings
      </h1>
      <Suspense fallback={<StandingsPanelSkeleton />}>
        <VerticalTab tabElements={tabs} params="by" defaultQuery={userTier} />
      </Suspense>
    </div>
  );
}
