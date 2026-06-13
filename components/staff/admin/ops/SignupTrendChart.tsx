"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SignupTrend, TrendPoint } from "@/lib/common/signups";

type Granularity = "weekly" | "monthly" | "bySeason";

const GRANULARITY_OPTIONS: { key: Granularity; label: string }[] = [
  { key: "weekly", label: "Week" },
  { key: "monthly", label: "Month" },
  { key: "bySeason", label: "Season" },
];

export default function SignupTrendChart({ trend }: { trend: SignupTrend }) {
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const data: TrendPoint[] = trend[granularity];

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm text-gray-500 dark:text-gray-300">
          Signups Over Time
        </h2>
        <div className="flex gap-1 text-xs">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setGranularity(option.key)}
              className={`rounded-md px-2 py-1 ${
                granularity === option.key
                  ? "bg-vdcRed text-white"
                  : "border border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <h2>{option.label}</h2>
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-vdcRed)"
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
