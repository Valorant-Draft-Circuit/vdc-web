"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import {
  killDeathRatio,
  overallRating,
  winPercent,
  type MapRow,
} from "@/lib/common/maps";

type SortCol =
  | "map"
  | "gp"
  | "wl"
  | "winrate"
  | "rating"
  | "atk"
  | "def"
  | "acs"
  | "kd"
  | "kast"
  | "hs";
type SortDir = "asc" | "desc";

type Props = {
  rows: MapRow[];
  isCombine: boolean;
};

const COLUMNS: Array<{ key: SortCol; label: string; defaultDir: SortDir }> = [
  { key: "map", label: "Map", defaultDir: "asc" },
  { key: "gp", label: "Games", defaultDir: "desc" },
  { key: "wl", label: "W-L", defaultDir: "desc" },
  { key: "winrate", label: "WR", defaultDir: "desc" },
  { key: "rating", label: "Rating", defaultDir: "desc" },
  { key: "atk", label: "Atk", defaultDir: "desc" },
  { key: "def", label: "Def", defaultDir: "desc" },
  { key: "acs", label: "ACS", defaultDir: "desc" },
  { key: "kd", label: "KD", defaultDir: "desc" },
  { key: "kast", label: "KAST", defaultDir: "desc" },
  { key: "hs", label: "HS%", defaultDir: "desc" },
];

function sortValue(row: MapRow, col: SortCol): number | string {
  switch (col) {
    case "map":
      return row.map;
    case "gp":
      return row.gamesPlayed;
    case "wl":
      return row.wins;
    case "winrate":
      return winPercent(row);
    case "rating":
      return overallRating(row);
    case "atk":
      return row.averages.ratingAttack;
    case "def":
      return row.averages.ratingDefense;
    case "acs":
      return row.averages.acs;
    case "kd":
      return killDeathRatio(row);
    case "kast":
      return row.averages.kast;
    case "hs":
      return row.averages.hsPercent;
  }
}

function displayValue(row: MapRow, col: SortCol): string {
  switch (col) {
    case "map":
      return row.map;
    case "gp":
      return String(row.gamesPlayed);
    case "wl":
      return `${row.wins}-${row.gamesPlayed - row.wins}`;
    case "winrate":
      return `${winPercent(row).toFixed(0)}%`;
    case "rating":
      return overallRating(row).toFixed(2);
    case "atk":
      return row.averages.ratingAttack.toFixed(2);
    case "def":
      return row.averages.ratingDefense.toFixed(2);
    case "acs":
      return row.averages.acs.toFixed(0);
    case "kd":
      return killDeathRatio(row).toFixed(2);
    case "kast":
      return `${row.averages.kast.toFixed(0)}%`;
    case "hs":
      return `${row.averages.hsPercent.toFixed(0)}%`;
  }
}

export default function MapTable({ rows, isCombine }: Props) {
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({
    col: "gp",
    dir: "desc",
  });

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = sortValue(a, sort.col);
      const bv = sortValue(b, sort.col);
      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : (av as number) - (bv as number);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort]);

  function onHeaderClick(col: SortCol, defaultDir: SortDir) {
    setSort((s) =>
      s.col === col
        ? { col, dir: s.dir === "asc" ? "desc" : "asc" }
        : { col, dir: defaultDir },
    );
  }

  const columns = isCombine
    ? COLUMNS.filter((c) => c.key !== "wl" && c.key !== "winrate")
    : COLUMNS;
  const dataColumns = columns.slice(1);

  return (
    <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-gray-600 mx-2 xl:mx-0">
      <table className="mx-auto w-full">
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort.col === c.key;
              const isFirst = c.key === "map";
              return (
                <th
                  key={c.key}
                  className={`sticky top-0 border-b border-gray-300 bg-gray-100 dark:bg-vdcBlack dark:text-vdcWhite p-4 text-xs xl:text-sm backdrop-blur-sm z-10 ${
                    isFirst
                      ? "left-0 z-30 bg-white dark:bg-vdcBlack min-w-[160px]"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onHeaderClick(c.key, c.defaultDir)}
                    className={`flex flex-row items-center cursor-pointer select-none hover:text-vdcRed ${
                      active ? "text-vdcRed" : ""
                    }`}
                  >
                    <h1>{c.label}</h1>
                    {active &&
                      (sort.dir === "asc" ? (
                        <ChevronUpIcon className="size-5" />
                      ) : (
                        <ChevronDownIcon className="size-5" />
                      ))}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={row.map}
              className="group hover:bg-gray-300 dark:hover:bg-vdcGrey/40 transition-colors"
            >
              <td className="relative border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-2 text-xs xl:text-sm dark:text-white sticky left-0 z-10 min-w-[160px] bg-vdcWhite dark:bg-vdcBlack group-hover:bg-gray-200 dark:group-hover:bg-vdcGrey transition-colors">
                <div className="flex items-center gap-2">
                  {row.splashUrl ? (
                    <Image
                      src={row.splashUrl}
                      alt={row.map}
                      width={300}
                      height={300}
                      className="rounded w-12 h-8 object-cover"
                    />
                  ) : (
                    <span className="w-12 h-8 rounded bg-vdcBlack/30" />
                  )}
                  <h2 className="truncate">{row.map}</h2>
                  {row.primaryRole && (
                    <Image
                      src={row.primaryRole.iconUrl}
                      alt={row.primaryRole.name}
                      width={16}
                      height={16}
                      className="w-4 h-4 invert dark:invert-0"
                    />
                  )}
                </div>
              </td>
              {dataColumns.map((c) => (
                <td
                  key={c.key}
                  className={
                    "border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-2 text-xs xl:text-sm dark:text-white"
                  }
                >
                  <h2>{displayValue(row, c.key)}</h2>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
