import { avg, sum } from "@/lib/common/math";
import { ProcessedPlayerStat } from "./PlayerSummary";
import StatChips from "./StatChips";

export function PlayerStats({ stats }: { stats: ProcessedPlayerStat[] }) {
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

  const adr = summedStats.totalDamage / summedStats.rounds || 0;
  const fkPercent = (summedStats.firstKills * 100) / summedStats.rounds || 0;
  const fdPercent = (summedStats.firstDeaths * 100) / summedStats.rounds || 0;

  const statChips: Array<[string, string]> = [
    ["ACS", summedStats.acs.toFixed(0)],
    ["ADR", adr.toFixed(0)],
    ["KDA", ((kpr + apr) / dpr).toFixed(2)],
    ["CLUT", String(summedStats.clutches)],
    ["FK%", `${fkPercent.toFixed(0)}%`],
    ["FD%", `${fdPercent.toFixed(0)}%`],
    ["KAST%", `${(summedStats.avgkast || 0).toFixed(0)}%`],
    ["HS%", `${(summedStats.hsPercent || 0).toFixed(0)}%`],
  ];

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 sm:px-6">
        <h1 className="text-sm italic">Stats</h1>
      </div>
      <div className="px-4 py-3 sm:p-6">
        <StatChips stats={statChips} />
      </div>
    </div>
  );
}
