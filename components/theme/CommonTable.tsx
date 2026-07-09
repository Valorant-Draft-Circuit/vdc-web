"use client";
import { AGENTS, AGENTURL } from "@/lib/common/constants/agents";
import {
  FIELDS,
  FormattedGameStat,
  FormattedStat,
} from "@/lib/queries/stats/stats";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/16/solid";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  HeaderGroup,
  Row,
  RowData,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, InputHTMLAttributes } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
} from "@headlessui/react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text";
  }
}

type CombineFilter = "all" | "eDE" | "eFA";

const TEXT_KEYS = [
  "discord",
  "name",
  "roles",
  "agents",
  "franchise",
  "team",
  "tier",
  "leagueStatus",
  "contractStatus",
];

export default function CommonTable({
  data,
  gameType,
  tier,
  season,
  hiddenFields,
  exportName = "vdc-stats",
}: {
  data;
  gameType?;
  tier?;
  season?: number;
  hiddenFields?: string[];
  exportName?: string;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [combineFilter, setCombineFilter] = useState<CombineFilter>("all");
  const [currentTierOnlyFilter, setCurrentTierOnlyFilter] =
    useState<boolean>(false);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "acs",
      desc: true,
    },
  ]);

  const columns = useMemo<
    ColumnDef<FormattedStat | FormattedGameStat>[]
  >(() => {
    if (!data || data.length === 0) return [];
    const sampleRow = data[0];
    const activeFields = FIELDS.filter(
      ({ key }) => key in sampleRow && !hiddenFields?.includes(key),
    );
    return activeFields.map(({ key, label }) => ({
      enableColumnFilter: ["name", "team"].includes(key),
      accessorKey: key,
      header: label,
      cell: ({ getValue, row }) => {
        const val = getValue();
        if (key === "team" && typeof val === "string") {
          const original = row.original as FormattedStat;
          if (!original.teamSlug) return val;
          const teamQuery = original.teamTier
            ? `?team=${original.teamTier.toLowerCase()}`
            : "";
          return (
            <Link
              href={`/franchises/${original.teamSlug}${teamQuery}`}
              className="hover:text-vdcRed"
            >
              {val}
            </Link>
          );
        }
        if (typeof val === "number") {
          const percentKeys = ["kast", "hs"];
          const roundedKeys = [
            "attackRating",
            "defenseRating",
            "rating",
            "kdr",
            "kpr",
            "apr",
            "adr",
            "fkpr",
            "fdpr",
            "acs",
          ];

          if (percentKeys.includes(key)) {
            return Math.round(val) + "%";
          }

          if (roundedKeys.includes(key)) {
            return val.toFixed(2);
          }

          return val;
        }

        if (Array.isArray(val)) {
          if (key === "roles") {
            return (
              <div className="flex flex-nowrap gap-1">
                {val.map((iconUrl: string) => (
                  <Image
                    key={iconUrl}
                    src={iconUrl}
                    alt="role"
                    width={16}
                    height={16}
                    className="size-4 invert dark:invert-0"
                  />
                ))}
              </div>
            );
          }
          return (
            <div className="flex flex-wrap gap-1">
              {val.map((agent: string) => (
                <Image
                  key={agent}
                  src={AGENTURL(AGENTS[agent.toUpperCase()])}
                  alt={agent}
                  width={500}
                  height={500}
                  className="size-6 xl:size-7"
                />
              ))}
            </div>
          );
        }
        return val ?? "—";
      },

      enableSorting: key !== "roles",
    }));
  }, [data, hiddenFields]);

  const filteredData = useMemo(() => {
    if (!data) return [];

    let dataToReturn = data;

    if (currentTierOnlyFilter) {
      dataToReturn = data.filter(
        (row) => row.currentTier.toUpperCase() === tier.toUpperCase(),
      );
    }

    switch (combineFilter) {
      case "eDE":
        return dataToReturn.filter(
          (row) => row.team === "DE" && row.matchesPlayed >= 8,
        );
      case "eFA":
        return dataToReturn.filter(
          (row) => row.team === "FA" && row.matchesPlayed >= 6,
        );
      default:
        return dataToReturn;
    }
  }, [data, combineFilter, currentTierOnlyFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;

      const hasACS = newSorting.some((s) => s.id === "acs");
      if (!hasACS) {
        newSorting.push({ id: "acs", desc: true });
      }

      setSorting(newSorting);
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const exportColumns = () =>
    table.getVisibleFlatColumns().filter((column) => column.id !== "roles");

  const exportFileName = () => {
    const today = new Date().toISOString().slice(0, 10);
    return [
      exportName,
      season ? `s${season}` : null,
      tier ? String(tier).toLowerCase() : null,
      today,
    ]
      .filter(Boolean)
      .join("-");
  };

  const downloadFile = (content: string, mimeType: string, extension: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${exportFileName()}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const csvColumns = exportColumns();
    const headerLine = csvColumns
      .map((column) => {
        const field = FIELDS.find(({ key }) => key === column.id);
        return csvCell(field?.label ?? column.id);
      })
      .join(",");
    const rowLines = table.getRowModel().rows.map((row) =>
      csvColumns
        .map((column) => {
          const value = row.getValue(column.id);
          if (Array.isArray(value)) return csvCell(value.join(" | "));
          return csvCell(value);
        })
        .join(","),
    );
    const csv = [headerLine, ...rowLines].join("\n");
    downloadFile(csv, "text/csv;charset=utf-8", "csv");
  };

  const exportJson = () => {
    const jsonColumns = exportColumns();
    const exportRows = table.getRowModel().rows.map((row) => {
      const exportRow: Record<string, unknown> = {};
      for (const column of jsonColumns) {
        exportRow[column.id] = row.getValue(column.id) ?? null;
      }
      return exportRow;
    });
    downloadFile(
      JSON.stringify(exportRows, null, 2),
      "application/json;charset=utf-8",
      "json",
    );
  };

  if (!data) {
    return <h1 className=" p-4 text-center text-vdcRed">Loading...</h1>;
  }
  if (data.length === 0) {
    return (
      <h1 className=" p-4 text-center text-vdcRed">No data to display.</h1>
    );
  }

  return (
    <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
      {gameType === "combine" && (
        <Filters
          combineFilter={combineFilter}
          setCombineFilter={setCombineFilter}
          currentTierOnlyFilter={currentTierOnlyFilter}
          setCurrentTierOnlyFilter={setCurrentTierOnlyFilter}
        />
      )}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs uppercase tracking-wider text-gray-500">
          {table.getRowModel().rows.length} players
        </h2>
        <Menu>
          <MenuButton className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-vdcWhite/40 dark:bg-vdcBlack/40 text-gray-600 dark:text-gray-400 data-hover:cursor-pointer data-hover:text-vdcRed">
            <ArrowDownTrayIcon className="size-4" />
            <h2>Export</h2>
            <ChevronDownIcon className="size-3.5" />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="z-50 mt-1 min-w-28 overflow-hidden rounded-md bg-vdcWhite dark:bg-vdcGrey shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            <MenuItem>
              <button
                type="button"
                onClick={exportCsv}
                className="w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider data-focus:bg-slate-200 dark:data-focus:bg-vdcBlack/40 hover:cursor-pointer"
              >
                <h2>CSV</h2>
              </button>
            </MenuItem>
            <MenuItem>
              <button
                type="button"
                onClick={exportJson}
                className="w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider data-focus:bg-slate-200 dark:data-focus:bg-vdcBlack/40 hover:cursor-pointer"
              >
                <h2>JSON</h2>
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableCol
                headerGroup={headerGroup}
                table={table}
                key={headerGroup.id}
              />
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <TableRow row={row} idx={idx} key={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filters({
  combineFilter,
  setCombineFilter,
  currentTierOnlyFilter,
  setCurrentTierOnlyFilter,
}) {
  const filterOptions = [
    { value: "all", label: "All" },
    { value: "eDE", label: "Eligible DE's" },
    { value: "eFA", label: "Eligible FA's" },
  ];
  return (
    <div className="pl-2 pt-2 flex gap-2 text-xs items-center divide-x-2">
      <div className="flex flex-row gap-2 pr-2">
        {filterOptions.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCombineFilter(filter.value as CombineFilter)}
            className={`p-1 xl:p-2 border rounded hover:cursor-pointer hover:text-vdcRed ${
              combineFilter === filter.value ? "text-vdcRed border-vdcRed" : ""
            }`}
          >
            <h1>{filter.label}</h1>
          </button>
        ))}
      </div>
      <div className="flex flex-row items-center gap-2">
        <h1 className="text-center">CURR TIER ONLY</h1>
        <Switch
          checked={currentTierOnlyFilter}
          onChange={(val) => setCurrentTierOnlyFilter(val ? true : false)}
          className="group relative inline-flex h-6 w-11 4xl:scale-150 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-vdcGrey transition-colors duration-200 ease-in-out inset-ring inset-ring-white/10 outline-offset-2 focus:ring-0 focus:ring-vdcWhite focus:ring-offset focus:outline-hidden data-checked:bg-vdcRed"
        >
          <span className="sr-only"></span>
          <span className="pointer-events-none relative inline-block size-5 transform rounded-full bg-vdcWhite shadow-sm ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-5">
            <span
              aria-hidden="true"
              className="absolute inset-0 flex size-full items-center justify-center transition-opacity duration-100 ease-in group-data-checked:opacity-0 group-data-checked:duration-100 group-data-checked:ease-out"
            ></span>
            <span
              aria-hidden="true"
              className="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-checked:opacity-100 group-data-checked:duration-200 group-data-checked:ease-in"
            ></span>
          </span>
        </Switch>
      </div>
    </div>
  );
}

type TableRowData = FormattedStat | FormattedGameStat;

function TableCol({
  headerGroup,
  table,
}: {
  headerGroup: HeaderGroup<TableRowData>;
  table: Table<TableRowData>;
}) {
  const sortingState = table.getState().sorting;
  const primarySortId = sortingState[0]?.id;

  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        const isPrimarySorted = header.column.id === primarySortId;
        const isSortable = header.column.getCanSort();

        const isTextColumn = TEXT_KEYS.includes(header.column.id);
        const fullTitle = FIELDS.find(
          (field) => field.key === header.column.id,
        )?.title;

        return (
          <th
            key={header.id}
            colSpan={header.colSpan}
            title={fullTitle}
            className={`sticky top-0 bg-slate-100 dark:bg-vdcGrey px-2 py-1 text-sm uppercase tracking-wider text-gray-500 whitespace-nowrap border-r border-vdcBlack/5 dark:border-vdcWhite/5 last:border-r-0 z-10 ${
              header.column.id === "name" ? "left-0 z-30" : ""
            } ${isTextColumn ? "text-left" : "text-center"}`}
          >
            {header.isPlaceholder ? null : (
              <div className="flex flex-col">
                <div
                  onClick={
                    isSortable
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  className={`flex flex-row items-center font-semibold ${
                    isTextColumn ? "" : "justify-center"
                  } ${
                    isSortable
                      ? "cursor-pointer select-none hover:text-vdcRed"
                      : ""
                  } ${isPrimarySorted ? "text-vdcRed" : ""}`}
                >
                  <h2>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                      ?.toString()
                      .replace("_", " ")}
                  </h2>
                  {{
                    asc: <ChevronUpIcon className="size-4" />,
                    desc: <ChevronDownIcon className="size-4" />,
                  }[header.column.getIsSorted() as string] ?? null}
                </div>
                {header.column.getCanFilter() ? (
                  <div>
                    <Filter column={header.column} />
                  </div>
                ) : null}
              </div>
            )}
          </th>
        );
      })}
    </tr>
  );
}

function TableRow({ row }: { row: Row<TableRowData>; idx: number }) {
  return (
    <tr
      key={row.id}
      className="group border-t border-vdcBlack/5 dark:border-vdcWhite/5 even:bg-slate-200/60 dark:even:bg-vdcBlack/15 hover:bg-slate-200 dark:hover:bg-vdcBlack/25"
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === "name") {
          const encodedPlayer = encodeURIComponent(cell.getValue() as string);
          return (
            <td
              key={cell.id}
              className="whitespace-nowrap px-2 py-2 sticky left-0 z-10 bg-slate-100 dark:bg-vdcGrey group-even:bg-slate-200 dark:group-even:bg-[#2c2f33] group-hover:bg-slate-200 dark:group-hover:bg-[#292c30] border-r border-vdcBlack/5 dark:border-vdcWhite/5"
            >
              <Link
                href={`/player/${encodedPlayer}`}
                className="hover:text-vdcRed"
              >
                <h2>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </h2>
              </Link>
            </td>
          );
        } else {
          const isTextColumn = TEXT_KEYS.includes(cell.column.id);
          return (
            <td
              key={cell.id}
              className={`whitespace-nowrap px-2 py-2 tabular-nums border-r border-vdcBlack/5 dark:border-vdcWhite/5 last:border-r-0 ${
                isTextColumn ? "text-left" : "text-center"
              }`}
            >
              <h2>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </h2>
            </td>
          );
        }
      })}
    </tr>
  );
}

function Filter({ column }: { column: Column<TableRowData> }) {
  const columnFilterValue = column.getFilterValue();
  return (
    <DebouncedInput
      className="w-full px-1.5 py-0.5 rounded border border-vdcRed/60 text-xs focus:border-vdcRed focus:outline-none dark:text-vdcWhite placeholder:text-gray-500"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
