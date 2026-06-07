"use client";

import { avg, sum } from "@/lib/common/math";

export function PlayerStats({ stats }: { stats }) {
  const summedStats = {
    totalKills: sum(stats.map((ps) => ps.kills)),
    totalAssists: sum(stats.map((ps) => ps.assists)),
    totalDeaths: sum(stats.map((ps) => ps.deaths)),
    firstKills: sum(stats.map((ps) => ps.firstKills)),
    firstDeaths: sum(stats.map((ps) => ps.firstDeaths)),
    totalDamage: sum(stats.map((ps) => ps.totalDamage)),
    rounds: sum(stats.map((ps) => ps.rounds)),
    avgkast: avg(stats.map((ps) => ps.kast)),
    clutches: sum(stats.map((ps) => ps.clutches)),
    hsPercent: avg(stats.map((ps) => ps.hsPercent)),
    acs: avg(stats.map((ps) => ps.acs)),
  };

  const kpr = summedStats.totalKills / summedStats.rounds || 0;
  const apr = summedStats.totalAssists / summedStats.rounds || 0;
  const dpr = summedStats.totalDeaths / summedStats.rounds || 0;
  const formattedStats = {
    ACS: summedStats.acs.toFixed(2),
    ADR: (summedStats.totalDamage / summedStats.rounds || 0).toFixed(2),
    KDA: ((kpr + apr) / dpr).toFixed(2),
    CLUT: summedStats.clutches,
    "FK%": `${(
      (summedStats.firstKills * 100) / summedStats.rounds || 0
    ).toFixed(2)}%`,
    "FD%": `${(
      (summedStats.firstDeaths * 100) / summedStats.rounds || 0
    ).toFixed(2)}%`,
    "KAST%": `${(summedStats.avgkast || 0).toFixed(2)}%`,
    "HS%": `${(summedStats.hsPercent || 0).toFixed(2)}%`,
  };

  const statsList = Object.entries(formattedStats).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 sm:px-6">
        <h1 className="text-sm italic">Stats</h1>
      </div>
      <div className="px-4 py-3 sm:p-6 grid grid-cols-2 text-sm gap-3 divide-gray-200 border-vdcBlack">
        {statsList.map((stat, index) => (
          <div
            className="flex flex-row text-center text-sm justify-between"
            key={index}
          >
            <h1 className="text-vdcRed">{stat.name}:</h1>
            <h2>{stat.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
