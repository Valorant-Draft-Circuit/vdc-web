"use client";

import { useSearchParams } from "next/navigation";

export default function StatsPanel({ defaultQueries }) {
  const searchParams = useSearchParams();
  const seasonQuery =
    searchParams.get("season")?.toLowerCase() || defaultQueries.season;
  const tierQuery =
    searchParams.get("tier")?.toLowerCase() || defaultQueries.tier;
  const gameTypeQuery = searchParams.get("type")?.toLowerCase();

  return (
    <div className="mx-auto py-2 max-w-7xl xl:py-12 flex flex-col gap-10">
    
    </div>
  );
}
