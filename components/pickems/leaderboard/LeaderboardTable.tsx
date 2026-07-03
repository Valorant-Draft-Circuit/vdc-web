"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { LeaderRow } from "@/lib/queries/pickems/getLeaderboard";
import PlayerAvatar from "@/components/pickems/common/PlayerAvatar";

type Props = {
  rows: LeaderRow[];
  viewerId: string | null;
  season: number;
  linkTier: string;
};

const RANK_COLOR: Record<number, string> = {
  1: "#f1c40f",
  2: "#cdd2da",
  3: "#cd853f",
};

const AVATAR_PALETTE = [
  "#9b59b6",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#FF9266",
  "#de3845",
];

const HEADER_BASE =
  "sticky top-0 z-10 border-b border-gray-300 bg-gray-100 px-2.5 py-3 text-[10px] uppercase tracking-wide text-vdcGrey backdrop-blur-sm dark:border-gray-600 dark:bg-vdcBlack dark:text-gray-400";
const CELL_BASE = "border-b border-gray-200 px-2.5 py-2.5 dark:border-gray-600";

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function accuracyValue(row: LeaderRow): number {
  if (row.resolved === 0) {
    return -1;
  }
  return row.correct / row.resolved;
}

function accuracyText(row: LeaderRow): string {
  if (row.resolved === 0) {
    return "-";
  }
  return `${Math.round((row.correct / row.resolved) * 100)}%`;
}

function isNumericColumn(columnId: string): boolean {
  return columnId !== "player";
}

function cellClasses(columnId: string): string {
  const alignment = isNumericColumn(columnId) ? "text-right" : "";
  if (columnId === "points") {
    return `${CELL_BASE} text-[15px] font-extrabold ${alignment}`;
  }
  if (columnId === "accuracy") {
    return `${CELL_BASE} text-sm text-vdcGrey dark:text-gray-400 ${alignment}`;
  }
  return `${CELL_BASE} text-sm ${alignment}`;
}

export default function LeaderboardTable({
  rows,
  viewerId,
  season,
  linkTier,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "points", desc: true },
  ]);
  const [search, setSearch] = useState("");

  const columns = useMemo<ColumnDef<LeaderRow>[]>(
    () => [
      {
        id: "player",
        header: "Player",
        accessorFn: (row) => row.name,
        enableSorting: false,
        cell: ({ row }) => {
          const player = row.original;
          const isViewer = viewerId !== null && player.userId === viewerId;
          return (
            <Link
              href={`/pickems/picks/${player.userId}?tier=${linkTier}&season=${season}`}
              className="flex items-center gap-2.5 transition-colors hover:cursor-pointer hover:text-vdcRed"
            >
              <PlayerAvatar
                name={player.name}
                image={player.image}
                fallbackColor={avatarColor(player.userId)}
                sizeClass="size-7"
                pixels={28}
                textClass="text-[11px]"
              />
              {player.name}
              {isViewer && (
                <h1 className="ml-1.5 text-[9px] font-extrabold text-vdcRed">
                  YOU
                </h1>
              )}
            </Link>
          );
        },
      },
      {
        id: "points",
        header: "Points",
        accessorKey: "points",
        cell: ({ getValue }) => getValue<number>(),
      },
      {
        id: "accuracy",
        header: "Accuracy",
        accessorFn: (row) => accuracyValue(row),
        cell: ({ row }) => accuracyText(row.original),
      },
    ],
    [viewerId, season, linkTier],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (rows.length === 0) {
    return (
      <h2 className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
        No picks have been made yet. Be the first one!
      </h2>
    );
  }

  const rankedRows = table.getRowModel().rows.map((row, index) => ({
    row,
    rank: index + 1,
  }));
  const query = search.trim().toLowerCase();
  const visibleRows = query
    ? rankedRows.filter(({ row }) =>
        row.original.name.toLowerCase().includes(query),
      )
    : rankedRows;
  const columnCount = table.getVisibleFlatColumns().length + 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-vdcGrey dark:text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name"
          className="w-full rounded-xl border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-vdcRed dark:border-gray-600"
        />
      </div>
      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-600">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className={`${HEADER_BASE} text-left`}>#</th>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const numeric = isNumericColumn(header.column.id);
                  const headerAlign = numeric ? "text-right" : "text-left";
                  const buttonAlign = numeric ? "ml-auto" : "";
                  const sortable = canSort
                    ? "cursor-pointer select-none hover:text-vdcRed"
                    : "";
                  const sortedColor = sorted ? "text-vdcRed" : "";
                  return (
                    <th
                      key={header.id}
                      className={`${HEADER_BASE} ${headerAlign}`}
                    >
                      <button
                        type="button"
                        disabled={!canSort}
                        onClick={header.column.getToggleSortingHandler()}
                        className={`flex items-center gap-1 ${buttonAlign} ${sortable} ${sortedColor}`}
                      >
                        <h1>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </h1>
                        {sorted === "asc" && (
                          <ChevronUpIcon className="size-4" />
                        )}
                        {sorted === "desc" && (
                          <ChevronDownIcon className="size-4" />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={columnCount}
                  className={`${CELL_BASE} py-8 text-center text-sm text-vdcGrey dark:text-gray-400`}
                >
                  <h2>No players match &ldquo;{search}&rdquo;.</h2>
                </td>
              </tr>
            )}
            {visibleRows.map(({ row, rank }) => {
              const isViewer =
                viewerId !== null && row.original.userId === viewerId;
              const rowClass = isViewer
                ? "bg-vdcRed/10 transition-colors hover:bg-vdcRed/20"
                : "transition-colors hover:bg-black/5 dark:hover:bg-white/5";
              return (
                <tr key={row.id} className={rowClass}>
                  <td
                    className={`${CELL_BASE} text-sm font-extrabold`}
                    style={{ color: RANK_COLOR[rank] }}
                  >
                    <h1>{rank}</h1>
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cellClasses(cell.column.id)}>
                      <h2>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </h2>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
