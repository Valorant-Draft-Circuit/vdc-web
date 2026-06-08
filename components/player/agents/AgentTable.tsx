"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { agentToUrlSlug } from "@/lib/common/agents";
import type { PlayerAgentBreakdown } from "@/lib/queries/stats/getPlayerAgentBreakdown";

type SortCol =
  | "agent"
  | "gp"
  | "winrate"
  | "rating"
  | "acs"
  | "kd"
  | "adr"
  | "kast"
  | "hs";
type SortDir = "asc" | "desc";

type Props = {
  rows: PlayerAgentBreakdown[];
  selectedSlug: string;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

const COLUMNS: Array<{ key: SortCol; label: string; defaultDir: SortDir }> = [
  { key: "agent", label: "Agent", defaultDir: "asc" },
  { key: "gp", label: "Games", defaultDir: "desc" },
  { key: "winrate", label: "WR", defaultDir: "desc" },
  { key: "rating", label: "Rating", defaultDir: "desc" },
  { key: "acs", label: "ACS", defaultDir: "desc" },
  { key: "kd", label: "KD", defaultDir: "desc" },
  { key: "adr", label: "ADR", defaultDir: "desc" },
  { key: "kast", label: "KAST", defaultDir: "desc" },
  { key: "hs", label: "HS%", defaultDir: "desc" },
];

function rowValue(row: PlayerAgentBreakdown, col: SortCol): number | string {
  switch (col) {
    case "agent":
      return row.catalog?.displayName ?? row.agent;
    case "gp":
      return row.gamesPlayed;
    case "winrate":
      return row.gamesPlayed === 0 ? 0 : row.wins / row.gamesPlayed;
    case "rating":
      return (row.averages.ratingAttack + row.averages.ratingDefense) / 2;
    case "acs":
      return row.averages.acs;
    case "kd":
      return row.totals.deaths === 0
        ? row.totals.kills
        : row.totals.kills / row.totals.deaths;
    case "adr":
      return row.rounds === 0 ? 0 : row.totals.damage / row.rounds;
    case "kast":
      return row.averages.kast;
    case "hs":
      return row.averages.hsPercent;
  }
}

function buildAgentHref(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  slug: string,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") next.set(k, v);
  }
  next.set("agent", slug);
  return `${basePath}?${next.toString()}`;
}

export default function AgentTable({
  rows,
  selectedSlug,
  basePath,
  searchParams,
}: Props) {
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({
    col: "gp",
    dir: "desc",
  });

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = rowValue(a, sort.col);
      const bv = rowValue(b, sort.col);
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

  return (
    <div className="overflow-auto rounded-2xl border border-gray-200 dark:border-gray-600 mx-2 xl:mx-0">
      <table className="mx-auto w-full">
        <thead>
          <tr>
            {COLUMNS.map((c) => {
              const active = sort.col === c.key;
              const isFirst = c.key === "agent";
              return (
                <th
                  key={c.key}
                  className={`sticky top-0 border-b italic border-gray-300 bg-gray-100 dark:bg-vdcBlack dark:text-vdcWhite p-4 text-xs xl:text-sm backdrop-blur-sm z-10 ${
                    isFirst ? "left-0 z-30 bg-white dark:bg-vdcBlack" : ""
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
          {sortedRows.map((row, idx) => {
            const slug = agentToUrlSlug(row.catalog?.displayName ?? row.agent);
            const winPct =
              row.gamesPlayed === 0 ? 0 : (row.wins / row.gamesPlayed) * 100;
            const rating =
              (row.averages.ratingAttack + row.averages.ratingDefense) / 2;
            const kd =
              row.totals.deaths === 0
                ? row.totals.kills
                : row.totals.kills / row.totals.deaths;
            const adr = row.rounds === 0 ? 0 : row.totals.damage / row.rounds;
            const role = row.catalog?.role;
            const isSelected = slug === selectedSlug;

            const rowBg = isSelected ? "bg-vdcRed/15" : "";
            const firstCellBg = "bg-vdcWhite dark:bg-vdcBlack";
            const rowHover = isSelected
              ? "hover:bg-vdcRed/25"
              : "hover:bg-gray-300 dark:hover:bg-vdcGrey/40";
            const stickyHover = "group-hover:bg-gray-200 dark:group-hover:bg-vdcGrey";

            const dataCells: Array<[SortCol, string | number]> = [
              ["gp", row.gamesPlayed],
              ["winrate", `${winPct.toFixed(0)}%`],
              ["rating", rating.toFixed(2)],
              ["acs", row.averages.acs.toFixed(0)],
              ["kd", kd.toFixed(2)],
              ["adr", adr.toFixed(0)],
              ["kast", `${row.averages.kast.toFixed(0)}%`],
              ["hs", `${row.averages.hsPercent.toFixed(0)}%`],
            ];

            return (
              <tr
                key={row.agent}
                className={`group ${rowBg} ${rowHover} transition-colors`}
              >
                <td
                  className={`relative border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-2 text-xs xl:text-sm dark:text-white sticky left-0 z-10 transition-colors ${firstCellBg} ${stickyHover}`}
                >
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-0 bottom-0 w-1 bg-vdcRed"
                    />
                  )}
                  <Link
                    href={buildAgentHref(basePath, searchParams, slug)}
                    scroll={false}
                    className="flex items-center gap-2"
                  >
                    {row.catalog?.displayIconUrl ? (
                      <Image
                        src={row.catalog.displayIconUrl}
                        alt={row.catalog.displayName}
                        width={40}
                        height={40}
                        className="rounded w-10 h-10"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded bg-vdcBlack/30" />
                    )}
                    <h2 className="truncate">
                      {row.catalog?.displayName ?? row.agent}
                    </h2>
                    {role && (
                      <Image
                        src={role.iconUrl}
                        alt={role.name}
                        width={16}
                        height={16}
                        className="w-4 h-4 invert dark:invert-0"
                      />
                    )}
                  </Link>
                </td>
                {dataCells.map(([key, value]) => (
                  <Cell key={key} value={value} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ value }: { value: string | number }) {
  return (
    <td className="border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-2 text-xs xl:text-sm dark:text-white">
      <h2>{value}</h2>
    </td>
  );
}
