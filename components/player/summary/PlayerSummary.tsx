"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PlayerRating from "./PlayerRating";
import { PlayerStats } from "./PlayerStats";
import { GameType, Prisma } from "@prisma/client";
import PlayerMatches from "./PlayerMatches";
import { InformationCircleIcon } from "@heroicons/react/16/solid";

type TStatsPayload = Prisma.PlayerStatsGetPayload<{
  include: { Game: { include: { Match: true } } };
}>;

export default function PlayerSummary() {
  const [stats, setStats] = useState<TStatsPayload[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { player } = useParams();
  const searchParams = useSearchParams();
  const season = searchParams.get("season");
  const gameType = searchParams.get("type")?.toLowerCase();

  useEffect(() => {
    if (!player || !season) {
      setStats(null);
      setLoading(false);
      return;
    }
    async function fetchStats() {
      try {
        const res = await fetch(
          `/api/player/stats/${player}?season=${season}&type=${gameType}`,
        );
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
  }, [player, season, gameType]);

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
    <div className="flex flex-col px-2 xl:px-0 gap-2">
      {gameType?.toUpperCase() === GameType.COMBINE && <CombineDisclaimer />}

      <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
        <div className="flex flex-col gap-2 xl:w-1/2">
          <>
            <PlayerRating stats={processedPlayerStats} />
            <PlayerStats stats={processedPlayerStats} />
          </>
        </div>
        <div className="w-full">
          <PlayerMatches stats={stats} gameType={gameType?.toUpperCase()} />
        </div>
      </div>
    </div>
  );
}
function CombineDisclaimer() {
  return (
    <div className="rounded-md bg-vdcRed/30 dark:bg-vdcRed/10 p-4 mx-2 xl:mx-0 outline outline-vdcRed/20">
      <div className="flex">
        <div className="shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="size-5 text-vdcRed"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-vdcBlack dark:text-vdcWhite font-roboto italic">
            Combine stats are stored differently than regular season stats. Some
            data might be different or missing entirely.
          </p>
        </div>
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
