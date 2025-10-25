"use client";

import { useParams, useSearchParams } from "next/navigation";
import StatsTable from "../stats/StatsTable";
import { useEffect, useState } from "react";

export default function MatchStats() {
  const [data, setData] = useState();
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.matchId;
  const gameParam = searchParams.get("game");
  console.log(gameParam);

  useEffect(() => {
    async function fetchStats() {
      let res;
      if (gameParam) {
        try {
          res = await fetch(`/api/stats/match/${matchId}/game/${gameParam}`);
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
          res = await fetch(`/api/stats/match/${matchId}`);
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

  console.log(data)

  return <StatsTable data={data} />;
}
