"use client";

import { useSearchParams } from "next/navigation";

export default function StatsTitle() {
  const searchParams = useSearchParams();
  const season = searchParams.get("season")?.toLowerCase();
  const tier = searchParams.get("by")?.toLowerCase();

  return (
    <h1 className="text-vdcRed italic text-2xl xl:text-3xl text-center xl:ml-30">
      Season {season} {tier} Stats
    </h1>
  );
}
