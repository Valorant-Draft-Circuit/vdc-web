"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { TeamMapBreakdown } from "@/lib/queries/stats/getTeamMapBreakdown";

export type TeamMapRow = TeamMapBreakdown & { splashUrl: string | null };

type SortCol =
  | "played"
  | "record"
  | "roundDiff"
  | "roundWinPercent"
  | "attackRating"
  | "defenseRating"
  | "pickCount"
  | "banCount";
type SortDir = "asc" | "desc";

const COLUMNS: { id: SortCol; label: string }[] = [
  { id: "played", label: "Played" },
  { id: "record", label: "W - L" },
  { id: "roundDiff", label: "+/-" },
  { id: "roundWinPercent", label: "RWP" },
  { id: "attackRating", label: "ATK" },
  { id: "defenseRating", label: "DEF" },
  { id: "pickCount", label: "Picked" },
  { id: "banCount", label: "Banned" },
];

export default function TeamMapTable({ rows }: { rows: TeamMapRow[] }) {
  const [sortCol, setSortCol] = useState<SortCol>("played");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedRows = useMemo(() => {
    const valueOf = (row: TeamMapRow): number | null =>
      sortCol === "record" ? row.wins - row.losses : row[sortCol];
    return [...rows].sort((first, second) => {
      const a = valueOf(first);
      const b = valueOf(second);
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return sortDir === "desc" ? b - a : a - b;
    });
  }, [rows, sortCol, sortDir]);

  const onHeaderClick = (col: SortCol) => {
    if (col === sortCol) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
      return;
    }
    setSortCol(col);
    setSortDir("desc");
  };

  return (
    <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
      <h2 className="text-sm tracking-wider uppercase font-semibold text-vdcRed mb-2">
        Maps
      </h2>
      {sortedRows.length === 0 ? (
        <h3 className="text-sm text-gray-500 dark:text-gray-400 py-1">
          No maps played yet
        </h3>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="uppercase tracking-wider text-gray-500">
                <th className="text-left py-1 pr-2 font-semibold whitespace-nowrap">
                  <h2>Map</h2>
                </th>
                {COLUMNS.map((column) => (
                  <th key={column.id} className="text-right py-1 px-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onHeaderClick(column.id)}
                      className={`font-semibold uppercase hover:cursor-pointer hover:text-vdcRed ${
                        sortCol === column.id ? "text-vdcRed" : ""
                      }`}
                    >
                      <h2>
                        {column.label}
                        {sortCol === column.id
                          ? sortDir === "desc"
                            ? " ▾"
                            : " ▴"
                          : ""}
                      </h2>
                    </button>
                  </th>
                ))}
                <th className="text-right py-1 px-2 font-semibold whitespace-nowrap">
                  <h2>Side</h2>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.map}
                  className="border-t border-vdcBlack/5 dark:border-vdcWhite/5 text-sm"
                >
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-3">
                      {row.splashUrl ? (
                        <div className="relative w-28 h-12 flex-none rounded-md overflow-hidden">
                          <Image
                            src={row.splashUrl}
                            alt={row.map}
                            fill
                            className="object-cover brightness-75"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-12 flex-none rounded-md bg-gray-300 dark:bg-vdcBlack/40" />
                      )}
                      <div className="flex flex-col gap-1">
                        <h2>{row.map}</h2>
                        {row.agents.length > 0 && (
                          <div className="flex items-center gap-1">
                            {row.agents.map((agent) =>
                              agent.iconUrl ? (
                                <Image
                                  key={agent.name}
                                  src={agent.iconUrl}
                                  alt={agent.name}
                                  title={agent.name}
                                  width={40}
                                  height={40}
                                  className="size-5 rounded"
                                />
                              ) : null,
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>{row.played}</h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>
                      {row.wins} - {row.losses}
                    </h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2 className={roundDiffColorClass(row.roundDiff)}>
                      {formatRoundDiff(row.roundDiff)}
                    </h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>
                      {row.roundWinPercent === null
                        ? "-"
                        : `${(row.roundWinPercent * 100).toFixed(0)}%`}
                    </h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>
                      {row.attackRating === null
                        ? "-"
                        : row.attackRating.toFixed(2)}
                    </h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>
                      {row.defenseRating === null
                        ? "-"
                        : row.defenseRating.toFixed(2)}
                    </h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>{row.pickCount}</h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>{row.banCount}</h2>
                  </td>
                  <td className="text-right px-2 tabular-nums whitespace-nowrap">
                    <h2>
                      {formatSidePreference(
                        row.attackSideChoices,
                        row.defenseSideChoices,
                      )}
                    </h2>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatRoundDiff(roundDiff: number | null): string {
  if (roundDiff === null) return "-";
  if (roundDiff > 0) return `+${roundDiff}`;
  return String(roundDiff);
}

function roundDiffColorClass(roundDiff: number | null): string {
  if (roundDiff === null || roundDiff === 0) return "";
  return roundDiff > 0 ? "text-vdcGreen" : "text-vdcRed";
}

function formatSidePreference(
  attackSideChoices: number,
  defenseSideChoices: number,
): string {
  const totalChoices = attackSideChoices + defenseSideChoices;
  if (totalChoices === 0) return "-";
  const attackShare = Math.round((attackSideChoices / totalChoices) * 100);
  return attackShare >= 50
    ? `${attackShare}% ATK`
    : `${100 - attackShare}% DEF`;
}
