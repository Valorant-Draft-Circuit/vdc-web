"use client";

import { useParams, useSearchParams } from "next/navigation";
import StatsTable from "../stats/StatsTable";
import { useEffect, useState } from "react";
import { FormattedGameStat, FormattedStat } from "@/lib/queries/stats/stats";

export default function MatchStats() {
  const [data, setData] = useState<FormattedStat[] | FormattedGameStat[]>();
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.matchId;
  const gameParam = searchParams.get("game");

  useEffect(() => {
    async function fetchStats() {
      let res;
      if (gameParam) {
        try {
          res = await fetch(`/api/match/${matchId}/game/${gameParam}`, {
            credentials: "include",
          });
          if (!res.ok) {
            throw new Error(`Error fetching stats: ${res.status}`);
          }
          const data = await res.json();
          setData(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          res = await fetch(`/api/match/${matchId}`, {
            credentials: "include",
          });
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
  }, [gameParam]);

  if (data?.length === 0) {
    return (
      <div className="p-10 m-auto text-vdcRed text-center">
        <h2 className="mt-4 rounded-lg border border-vdcRed/40 bg-vdcRed/10 px-4 py-3 text-sm xl:text-lg text-center">
          No stats found. Please check back later as they might not have been
          processed yet!
        </h2>
      </div>
    );
  }

  return <StatsTable data={data} />;
}
