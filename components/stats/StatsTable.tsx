"use client";
import { FIELDS, FormattedStat } from "@/lib/queries/stats/stats";
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

  const columns = useMemo<ColumnDef<FormattedStat>[]>(() => {
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
          const percentKeys = ["kast", "hs", "mapWinPercent", "roundWinPercent"];
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
            ...percentKeys,
          ];

          if (roundedKeys.includes(key)) {
            let displayVal = val;
            if (key === "mapWinPercent" || key === "roundWinPercent") {
              displayVal = val * 100;
            }
            return displayVal.toFixed(2) + (percentKeys.includes(key) ? "%" : "");
          }
          return val;
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
    onSortingChange: setSorting,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  if (!data) {
    return (
      <div className="max-h-[70vh] overflow-auto rounded-2xl">
        <table className="mx-auto w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableColSkeleton key={headerGroup.id} />
            ))}
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, idx) => (
              <TableRowSkeleton idx={idx} key={idx} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <h1 className=" p-4 text-center text-vdcRed">No data to display.</h1>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-2xl">
      <table className="mx-auto w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableCol headerGroup={headerGroup} key={headerGroup.id} />
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

function TableCol({ headerGroup }) {
  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        return (
          <th
            key={header.id}
            colSpan={header.colSpan}
            className={`sticky top-0 border-b italic border-gray-300 bg-gray-100 dark:bg-vdcBlack dark:text-vdcWhite p-4 text-sm 4xl:text-md backdrop-blur-sm z-10 ${
              header.column.id === "name"
                ? "left-0 z-30 bg-white dark:bg-vdcBlack"
                : ""
            }`}
          >
            {header.isPlaceholder ? null : (
              <div className="flex flex-col">
                <div
                  onClick={header.column.getToggleSortingHandler()}
                  className={`${
                    header.column.getCanSort()
                      ? "cursor-pointer select-none hover:text-vdcRed"
                      : ""
                  }  ${
                    header.column.getIsSorted() ? "text-vdcRed" : ""
                  } flex flex-row`}
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
              className={`border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-4 text-sm 4xl:text-md dark:text-white sticky left-0 z-10 bg-gray-200 dark:bg-vdcGrey`}
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
              className="border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-4 text-sm 4xl:text-md dark:text-white"
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
      className="w-full px-1 border border-vdcGrey rounded text-sm focus:outline-vdcRed dark:text-vdcWhite"
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

function TableColSkeleton() {
  return (
    <tr>
      {Array.from({ length: 21 }).map((_, i) => {
        return (
          <th
            key={i}
            className="sticky top-0 border-b border-gray-300 bg-gray-100 dark:bg-vdcBlack dark:text-vdcWhite p-4 text-sm backdrop-blur-sm z-10 w-20"
          >
            <div className="flex flex-col">
              <div className="h-5 w-20 bg-gray-400 dark:bg-gray-600 rounded"></div>
            </div>
          </th>
        );
      })}
    </tr>
  );
}
function TableRowSkeleton({ idx }) {
  return (
    <tr
      {...{
        className: idx % 2 === 0 ? "bg-gray-300 dark:bg-vdcGrey" : "",
      }}
    >
      {Array.from({ length: 21 }).map((_, i) => {
        return (
          <td
            key={i}
            className={`border-b border-r border-gray-200 dark:border-gray-600 whitespace-nowrap px-3 py-4 text-sm dark:text-white animate-pulse`}
          >
            <div className="h-5 w-auto bg-gray-400 dark:bg-gray-600 rounded"></div>
          </td>
        );
      })}
    </tr>
  );
}
