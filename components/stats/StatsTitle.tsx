"use client";

import { Tier } from "@prisma/client";
import { useSearchParams } from "next/navigation";

type DefaultStatsQueries = { season: number; tier: Tier };

export default function StatsTitle({
  defaultQueries,
}: {
  defaultQueries: DefaultStatsQueries;
}) {
  const searchParams = useSearchParams();
  const season =
    searchParams.get("season")?.toLowerCase() || defaultQueries.season;
  const tier = searchParams.get("tier")?.toLowerCase() || defaultQueries.tier;

  return (
    <div className="text-vdcRed flex flex-col xl:flex-row xl:gap-2 text-2xl xl:text-3xl text-center">
      <h1>Season {season}</h1>
      <h1>{tier} Stats</h1>
    </div>
  );
}
