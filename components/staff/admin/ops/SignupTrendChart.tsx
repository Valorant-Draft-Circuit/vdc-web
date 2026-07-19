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
import {
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_TEXT_STYLE,
} from "@/lib/common/constants/charts";
import { SignupTrend, TrendPoint, TrendSeries } from "@/lib/common/signups";

type Granularity = "weekly" | "monthly" | "bySeason";
type Mode = keyof TrendSeries;

const GRANULARITY_OPTIONS: { key: Granularity; label: string }[] = [
  { key: "weekly", label: "Week" },
  { key: "monthly", label: "Month" },
  { key: "bySeason", label: "Season" },
];

const MODE_OPTIONS: { key: Mode; label: string }[] = [
  { key: "cumulative", label: "Total" },
  { key: "newPerPeriod", label: "New" },
];

const MODE_TOOLTIP_LABEL: Record<Mode, string> = {
  cumulative: "Total players",
  newPerPeriod: "New signups",
};

export default function SignupTrendChart({ trend }: { trend: SignupTrend }) {
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [mode, setMode] = useState<Mode>("cumulative");
  const data: TrendPoint[] = trend[granularity][mode];

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm text-gray-500 dark:text-gray-300">
          Players Over Time
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex gap-1">
            {MODE_OPTIONS.map((option) => (
              <ToggleButton
                key={option.key}
                label={option.label}
                isActive={mode === option.key}
                onClick={() => setMode(option.key)}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {GRANULARITY_OPTIONS.map((option) => (
              <ToggleButton
                key={option.key}
                label={option.label}
                isActive={granularity === option.key}
                onClick={() => setGranularity(option.key)}
              />
            ))}
          </div>
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
          <XAxis
            dataKey="label"
            tick={CHART_TICK_STYLE}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis allowDecimals={false} tick={CHART_TICK_STYLE} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
            labelStyle={{
              color: "var(--color-vdcWhite)",
              ...CHART_TOOLTIP_TEXT_STYLE,
            }}
            itemStyle={CHART_TOOLTIP_TEXT_STYLE}
            formatter={(value) => [
              String(value ?? ""),
              MODE_TOOLTIP_LABEL[mode],
            ]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-vdcRed)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ToggleButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 ${
        isActive
          ? "bg-vdcRed text-white"
          : "border border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300"
      }`}
    >
      <h2>{label}</h2>
    </button>
  );
}
