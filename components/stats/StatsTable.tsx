"use client";
import { AGENTS, AGENTURL } from "@/lib/common/constants";
import {
  FIELDS,
  FormattedGameStat,
  FormattedStat,
  FormattedTeamStat,
} from "@/lib/queries/stats/stats";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  RowData,
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
import { Switch } from "@headlessui/react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text";
  }
}

type TCombineFilter = "all" | "eDE" | "eFA";

export default function StatsTable({
  data,
  gameType,
  tier,
  season,
  currentSeason,
}: {
  data;
  gameType?;
  tier?;
  season?;
  currentSeason?;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [combineFilter, setCombineFilter] = useState<TCombineFilter>("all");
  const [currentTierOnlyFilter, setCurrentTierOnlyFilter] =
    useState<boolean>(false);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "acs",
      desc: true,
    },
  ]);

  const columns = useMemo<
    ColumnDef<FormattedStat | FormattedGameStat | FormattedTeamStat>[]
  >(() => {
    if (!data || data.length === 0) return [];
    const sampleRow = data[0];
    const activeFields = FIELDS.filter(({ key }) => key in sampleRow);
    return activeFields.map(({ key, label }) => ({
      enableColumnFilter: ["name", "team"].includes(key),
      accessorKey: key,
      header: label,
      cell: ({ getValue }) => {
        const val = getValue();
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

      enableSorting: true,
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    console.log(currentTierOnlyFilter);

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

  if (!data) {
    return <h1 className=" p-4 text-center text-vdcRed">Loading...</h1>;
  }
  if (data.length === 0) {
    return (
      <h1 className=" p-4 text-center text-vdcRed">No data to display.</h1>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-600">
      {gameType === "combine" && season === currentSeason && (
        <Filters
          combineFilter={combineFilter}
          setCombineFilter={setCombineFilter}
          currentTierOnlyFilter={currentTierOnlyFilter}
          setCurrentTierOnlyFilter={setCurrentTierOnlyFilter}
        />
      )}
      <table className="mx-auto w-full">
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
            onClick={() => setCombineFilter(filter.value as TCombineFilter)}
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

function TableCol({ headerGroup, table }) {
  const sortingState = table.getState().sorting;
  const primarySortId = sortingState[0]?.id;

  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        const isPrimarySorted = header.column.id === primarySortId;
        const isSortable = header.column.getCanSort();

        return (
          <th
            key={header.id}
            colSpan={header.colSpan}
            className={`sticky top-0 border-b italic border-gray-300 bg-gray-100 dark:bg-vdcBlack dark:text-vdcWhite p-4 text-xs xl:text-sm 4xl:text-md backdrop-blur-sm z-10 ${
              header.column.id === "name"
                ? "left-0 z-30 bg-white dark:bg-vdcBlack"
                : ""
            }`}
          >
            {header.isPlaceholder ? null : (
              <div className="flex flex-col">
                <div
                  onClick={
                    isSortable
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  className={`flex flex-row ${
                    isSortable
                      ? "cursor-pointer select-none hover:text-vdcRed"
                      : ""
                  } ${isPrimarySorted ? "text-vdcRed" : ""}`}
                >
                  <h1>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                      ?.toString()
                      .replace("_", " ")}
                  </h1>
                  {{
                    asc: <ChevronUpIcon className="size-5" />,
                    desc: <ChevronDownIcon className="size-5" />,
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

function TableRow({ row, idx }) {
  return (
    <tr
      key={row.id}
      {...{
        className: idx % 2 === 0 ? "bg-gray-300 dark:bg-vdcGrey" : "",
      }}
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === "name") {
          const encodedPlayer = encodeURIComponent(cell.getValue());
          return (
            <td
              key={cell.id}
              className={`border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-4 text-xs xl:text-sm md dark:text-white sticky left-0 z-10 bg-gray-200 dark:bg-vdcGrey`}
            >
              <Link
                href={`/player/${encodedPlayer}`}
                className="hover:text-vdcRed hover:underline"
              >
                <h2>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </h2>
              </Link>
            </td>
          );
        } else {
          return (
            <td
              key={cell.id}
              className="border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-4 text-xs xl:text-sm 4xl:text-md dark:text-white"
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

function Filter({ column }: { column: Column<unknown> }) {
  const columnFilterValue = column.getFilterValue();
  return (
    <DebouncedInput
      className="w-full px-1 border border-vdcGrey rounded text-xsxl:text-sm  focus:outline-vdcRed dark:text-vdcWhite"
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
