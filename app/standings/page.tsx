import StandingsPanel from "@/components/standings/StandingsPanel";
import TabSelector from "@/components/tabs/TabSelector";
import React from "react";
import { Tier } from "@prisma/client";

export type StandingsTab = {
  tier: string;
  color: string;
  content: React.ReactNode;
};
const tabs: StandingsTab[] = [
  {
    tier: "franchises",
    color: "text-vdcRed",
    content: <StandingsPanel query="franchises" />,
  },
  {
    tier: Tier.MYTHIC,
    color: "text-vdcPurple",
    content: <StandingsPanel query={Tier.MYTHIC} />,
  },
  {
    tier: Tier.EXPERT,
    color: "text-vdcBlue",
    content: <StandingsPanel query={Tier.EXPERT} />,
  },
  {
    tier: Tier.APPRENTICE,
    color: "text-vdcGreen",
    content: <StandingsPanel query={Tier.APPRENTICE} />,
  },
  {
    tier: Tier.PROSPECT,
    color: "text-vdcYellow",
    content: <StandingsPanel query={Tier.PROSPECT} />,
  },
];

export default function Standings() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-12 xl:py-12 flex flex-col gap-10">
      <TabSelector tabElements={tabs} />
    </div>
  );
}
