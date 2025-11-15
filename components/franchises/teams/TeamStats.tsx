"use client";

import StatsTable from "@/components/stats/StatsTable";
import { FormattedTeamStat } from "@/lib/queries/stats/stats";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeamStatsPanel() {
  const [data, setData] = useState<FormattedTeamStat[]>();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const teamParam = searchParams.get("team");

  useEffect(() => {
    async function fetchStats() {
      let res;

      try {
        res = await fetch(`/api/stats/franchise/${slug}/tier/${teamParam}`);
        if (!res.ok) {
          throw new Error(`Error fetching stats: ${res.status}`);
        }
        const data = await res.json();
        setData(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchStats();
  }, [teamParam]);

  return <StatsTable data={data} />;
}
