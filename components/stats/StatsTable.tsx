"use client";
import { AGENTS, AGENTURL } from "@/lib/common/constants";
import {
  FIELDS,
  FormattedGameStat,
  FormattedStat,
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

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text";
  }
}
export default function StatsTable({ data }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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

  const table = useReactTable({
    data,
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
    <div className="max-h-[70vh] overflow-auto rounded-2xl border-1 border-gray-200 dark:border-gray-600">
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
                      header.getContext()
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
