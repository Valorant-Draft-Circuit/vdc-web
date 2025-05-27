import StandingsPanel from "@/components/standings/StandingsPanel";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import React, { Suspense } from "react";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import StandingsPanelSkeleton from "@/components/standings/StandingsPanelSkeleton";
import { Metadata } from "next";

const CURRENT_SEASON = await getSeasonCached();

export const metadata: Metadata = {
  title: `VDC | Season ${CURRENT_SEASON} Standings`,
  description: `Season ${CURRENT_SEASON} Standings`,
};
const tabs: TTabElements[] = TIERS_LIST.map((tier) => ({
  tier: tier,
  tabName: tier,
  color: TIER_COLOR_MAP[tier],
  content: <StandingsPanel query={tier} />,
}));
tabs.unshift({
  tier: "franchises",
  tabName: "franchises",
  color: "vdcRed",
  content: <StandingsPanel query="franchises" />,
});

export default async function Standings() {
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed italic text-3xl text-center xl:ml-30">
        Season {CURRENT_SEASON} Standings
      </h1>
      <Suspense fallback={<StandingsPanelSkeleton />}>
        <VerticalTab tabElements={tabs} params="by" />
      </Suspense>
    </div>
  );
}
