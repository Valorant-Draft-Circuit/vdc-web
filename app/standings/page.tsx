import StandingsPanel from "@/components/standings/StandingsPanel";
import TabSelector, { TabElements } from "@/components/tabs/TabSelector";
import React, { Suspense } from "react";
import { Tier } from "@prisma/client";
import { getSeasonCached } from "@/lib/common/cache";

const tabs: TabElements[] = [
  {
    tier: "franchises",
    color: "vdcRed",
    content: <StandingsPanel query="franchises" />,
  },
  {
    tier: Tier.MYTHIC,
    color: "vdcPurple",
    content: <StandingsPanel query={Tier.MYTHIC} />,
  },
  {
    tier: Tier.EXPERT,
    color: "vdcBlue",
    content: <StandingsPanel query={Tier.EXPERT} />,
  },
  {
    tier: Tier.APPRENTICE,
    color: "vdcGreen",
    content: <StandingsPanel query={Tier.APPRENTICE} />,
  },
  {
    tier: Tier.PROSPECT,
    color: "vdcYellow",
    content: <StandingsPanel query={Tier.PROSPECT} />,
  },
];

export default async function Standings() {
  const currentSeason = await getSeasonCached();

  return (
    <div className="mx-auto py-10 max-w-7xl px-4 sm:px-6 xl:px-12 xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed italic text-3xl text-center xl:ml-30">
        Season {currentSeason} Standings
      </h1>
      <Suspense fallback={<div>Loading schedule…</div>}>
        <TabSelector tabElements={tabs} />
      </Suspense>
    </div>
  );
}
