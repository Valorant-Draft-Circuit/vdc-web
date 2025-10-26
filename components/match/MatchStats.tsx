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
            console.log(res);
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
        <h1>
          We are working to implement stats on legacy match data. Please check
          back later!
        </h1>
      </div>
    );
  }

  return <StatsTable data={data} />;
}
