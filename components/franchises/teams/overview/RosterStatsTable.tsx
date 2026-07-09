"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowsRightLeftIcon } from "@heroicons/react/16/solid";
import DiscordBadge from "@/components/buttons/DiscordBadge";
import PlayerAvatar from "@/components/theme/PlayerAvatar";
import { avatarColor } from "@/lib/common/avatar";
import { RosterBadge, RosterStatRow } from "@/lib/common/team";

type SortCol = "rating" | "acs" | "kills" | "deaths" | "assists" | "kdr";
type SortDir = "asc" | "desc";

const COLUMNS: {
  id: SortCol;
  label: string;
  decimals: number;
  wide: boolean;
}[] = [
  { id: "rating", label: "RATING", decimals: 2, wide: false },
  { id: "acs", label: "ACS", decimals: 1, wide: false },
  { id: "kills", label: "K", decimals: 0, wide: true },
  { id: "deaths", label: "D", decimals: 0, wide: true },
  { id: "assists", label: "A", decimals: 0, wide: true },
  { id: "kdr", label: "KD", decimals: 2, wide: true },
];

const BADGE_COLOR_MAP: Record<RosterBadge, string> = {
  CAPTAIN: "bg-vdcYellow/20 text-vdcYellow",
  IR: "bg-vdcRed/20 text-vdcRed",
  "SUBBED IN": "bg-vdcBlue/20 text-vdcBlue",
  "SUBBED OUT": "bg-vdcBlue/20 text-vdcBlue",
};

export default function RosterStatsTable({
  rows,
  mmrShow,
}: {
  rows: RosterStatRow[];
  mmrShow: boolean;
}) {
  const [sortCol, setSortCol] = useState<SortCol>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedRows = useMemo(() => {
    const compare = (first: RosterStatRow, second: RosterStatRow) => {
      if (first.isRosterMember !== second.isRosterMember) {
        return first.isRosterMember ? -1 : 1;
      }
      const a = first[sortCol];
      const b = second[sortCol];
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return sortDir === "desc" ? b - a : a - b;
    };
    return [...rows].sort(compare);
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
        Roster
      </h2>
      {sortedRows.some((row) => row.replaces) && (
        <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Subbed out players share a row with their replacement 
          and the sub&apos;s stats are shown. Use the swap button to
          see the original player.
        </h3>
      )}
      {sortedRows.length === 0 ? (
        <h2 className="text-sm text-gray-500 dark:text-gray-400">
          No players rostered
        </h2>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="text-left py-1 pr-2 font-semibold">Player</th>
                {COLUMNS.map((column) => (
                  <th
                    key={column.id}
                    className={`text-right py-1 px-2 ${column.wide ? "hidden sm:table-cell" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => onHeaderClick(column.id)}
                      className={`font-semibold uppercase hover:cursor-pointer hover:text-vdcRed ${
                        sortCol === column.id ? "text-vdcRed" : ""
                      }`}
                    >
                      {column.label}
                      {sortCol === column.id
                        ? sortDir === "desc"
                          ? " ▾"
                          : " ▴"
                        : ""}
                    </button>
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <RosterStatRowItem key={row.key} row={row} mmrShow={mmrShow} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RosterStatRowItem({
  row,
  mmrShow,
}: {
  row: RosterStatRow;
  mmrShow: boolean;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const displayed = showOriginal && row.replaces ? row.replaces : row;

  return (
    <tr className="border-t border-vdcBlack/5 dark:border-vdcWhite/5">
      <td className="py-2 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <PlayerAvatar
            name={displayed.displayName}
            image={displayed.avatarUrl}
            fallbackColor={avatarColor(displayed.key)}
            sizeClass="size-7"
            pixels={28}
            textClass="text-[11px]"
          />
          <div className="flex flex-col min-w-0">
            <h2 className="truncate">
              {displayed.playerIgn ? (
                <Link
                  href={`/player/${encodeURIComponent(displayed.playerIgn)}`}
                  className="hover:text-vdcRed"
                >
                  {displayed.displayName}
                </Link>
              ) : (
                displayed.displayName
              )}
            </h2>
            {row.replaces && (
              <h2 className="text-[10px] text-gray-500 truncate">
                {showOriginal
                  ? `subbed out - ${row.displayName} in`
                  : `in for ${row.replaces.displayName}`}
              </h2>
            )}
            {mmrShow && displayed.mmr !== null && (
              <h2 className="text-md text-gray-500">{displayed.mmr} MMR</h2>
            )}
          </div>
          {displayed.badge && (
            <h2
              className={`rounded px-1.5 py-0.5 font-bold tracking-wider flex-none ${BADGE_COLOR_MAP[displayed.badge]}`}
            >
              {displayed.badge}
            </h2>
          )}
          {!displayed.isRosterMember && (
            <h2 className="rounded px-1.5 py-0.5 font-bold tracking-wider flex-none bg-vdcBlue/20 text-vdcBlue">
              SUB
            </h2>
          )}
          {row.replaces && (
            <button
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              title={
                showOriginal
                  ? `Show ${row.displayName}'s stats`
                  : `Show ${row.replaces.displayName}'s stats`
              }
              className="flex-none rounded p-0.5 hover:cursor-pointer hover:text-vdcRed"
            >
              <ArrowsRightLeftIcon className="size-3.5" />
            </button>
          )}
        </div>
      </td>
      {COLUMNS.map((column) => (
        <td
          key={column.id}
          className={`text-right px-2 tabular-nums ${column.wide ? "hidden sm:table-cell" : ""}`}
        >
          <h2>{formatStat(displayed[column.id], column.decimals)}</h2>
        </td>
      ))}
      <td className="text-right pl-2 whitespace-nowrap">
        {displayed.discordId && (
          <Link
            href={`https://discord.com/users/${displayed.discordId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block hover:opacity-80"
          >
            <DiscordBadge />
          </Link>
        )}
      </td>
    </tr>
  );
}

function formatStat(value: number | null, decimals: number): string {
  if (value === null) return "-";
  return value.toFixed(decimals);
}
