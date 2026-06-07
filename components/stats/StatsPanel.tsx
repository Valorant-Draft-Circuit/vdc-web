"use client";

import { Tier } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import StatsTable from "./StatsTable";
import { useEffect, useState } from "react";

type DefaultStatsQueries = { season: number; tier: Tier };

export default function StatsPanel({
  defaultQueries,
}: {
  defaultQueries: DefaultStatsQueries;
}) {
  const [data, setData] = useState();
  const searchParams = useSearchParams();
  const seasonQuery =
    searchParams.get("season")?.toLowerCase() || defaultQueries.season;
  const tierQuery =
    searchParams.get("tier")?.toLowerCase() || defaultQueries.tier;
  const gameTypeQuery = searchParams.get("type")?.toLowerCase();

  useEffect(() => {
    async function fetchStats() {
      if (seasonQuery && gameTypeQuery && tierQuery) {
        try {
          const res = await fetch(
            `/api/stats?type=${gameTypeQuery}&tier=${tierQuery}&season=${seasonQuery}`,
          );
          if (!res.ok) {
            throw new Error(`Error fetching stats: ${res.status}`);
          }
          const data = await res.json();
          setData(data);
        } catch (err) {
          console.error(err);
        }
      }
    }
    fetchStats();
  }, [seasonQuery, tierQuery, gameTypeQuery]);
  return <StatsTable data={data} gameType={gameTypeQuery} tier={tierQuery} />;
}
