"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PlayerRating from "./PlayerRating";
import { PlayerStats } from "./PlayerStats";
import { Prisma } from "@prisma/client";
import PlayerMatches from "./PlayerMatches";
type StatsPayload = Prisma.PlayerStatsGetPayload<{
  include: { Game: { include: { Match: true } } };
}>;
export default function PlayerSummary() {
  const { player } = useParams();
  const searchParams = useSearchParams();
  const season = searchParams.get("season");
  const [stats, setStats] = useState<StatsPayload[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!player || !season) {
      setStats(null);
      setLoading(false);
      return;
    }
    async function fetchStats() {
      try {
        const res = await fetch(`/api/player/stats/${player}?season=${season}`);
        if (!res.ok) {
          throw new Error(`Error fetching stats: ${res.status}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [player, season]);

  if (loading) {
    return <Load />;
  }

  if (!stats || stats.length === 0) {
    return <NoStats />;
  }

  const processedPlayerStats = stats.map((s) => {
    const rounds = s.Game.rounds;
    return { ...s, rounds: rounds, totalDamage: s.damage };
  });

  return (
    <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
      <div className="flex flex-col gap-2 xl:w-1/2">
        <>
          <PlayerRating stats={processedPlayerStats} />
          <PlayerStats stats={processedPlayerStats} />
        </>
      </div>
      <div className="w-full">
        <PlayerMatches stats={stats} />
      </div>
    </div>
  );
}

export function NoStats() {
  return (
    <div className="m-auto text-center py-10">
      <h1 className="text-vdcRed">
        Player has no available stats for the season!
      </h1>
    </div>
  );
}

function Load() {
  return (
    <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
      <div className="flex flex-col gap-2 xl:w-1/3">
        <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm ">
          <div className="px-4 py-2 sm:px-6 animate-pulse ">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="px-4 py-3 sm:p-6 grid grid-cols-3 italic text-center gap-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex flex-col" key={i}>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded " />
              </div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm ">
          <div className="px-4 py-2 sm:px-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="px-4 py-3 sm:p-6 grid grid-cols-3 italic text-center gap-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex flex-col" key={i}>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded " />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
