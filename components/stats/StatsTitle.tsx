"use client";

import { useSearchParams } from "next/navigation";

export default function StatsTitle({ defaultQueries }) {
  const searchParams = useSearchParams();
  const season =
    searchParams.get("season")?.toLowerCase() || defaultQueries.season;
  const tier = searchParams.get("tier")?.toLowerCase() || defaultQueries.tier;
  const gameType = searchParams.get("type")?.toLowerCase();

  return (
    <div className="text-vdcRed italic text-2xl xl:text-3xl text-center">
      <h1>Season {season}</h1>
      <h1>{tier} Stats</h1>
    </div>
  );
}
