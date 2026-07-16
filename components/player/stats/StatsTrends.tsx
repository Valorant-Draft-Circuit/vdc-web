"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  buildTrendSeries,
  seasonBoundaryIndices,
  TREND_METRIC_LABELS,
  type StatRow,
  type TrendMetric,
} from "@/lib/common/indepth";
import {
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_TEXT_STYLE,
} from "@/lib/common/constants/charts";

const METRICS: TrendMetric[] = ["rating", "acs", "adr", "kast", "kd", "hsPercent"];

const DOMAIN_PADDING_FACTOR = 1.1;

function centeredDomain(
  center: number,
  values: number[],
): [number, number] {
  const maxDistanceFromCenter = values.reduce(
    (max, value) => Math.max(max, Math.abs(value - center)),
    0,
  );
  const fallbackHalfSpan = Math.max(Math.abs(center) * 0.1, 0.1);
  const halfSpan =
    (maxDistanceFromCenter || fallbackHalfSpan) * DOMAIN_PADDING_FACTOR;
  return [center - halfSpan, center + halfSpan];
}

function shortDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fullDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StatsTrends({
  rows,
  showSeasonDividers,
  tierAverages,
}: {
  rows: StatRow[];
  showSeasonDividers: boolean;
  tierAverages: Record<TrendMetric, number> | null;
}) {
  const [metric, setMetric] = useState<TrendMetric>("rating");
  const series = buildTrendSeries(rows, metric);
  const boundaries = showSeasonDividers ? seasonBoundaryIndices(rows) : [];
  const tierAverage = tierAverages
    ? Number(tierAverages[metric].toFixed(2))
    : null;
  const yDomain: [number, number] | ["auto", "auto"] =
    tierAverage !== null && series.length > 0
      ? centeredDomain(
          tierAverage,
          series.map((point) => point.value),
        )
      : ["auto", "auto"];

  return (
    <div className="bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm rounded-md">
      <div className="px-4 pt-3 flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-3">
          <h1 className="text-md tracking-wider text-vdcRed">Trend</h1>
          {tierAverage !== null ? (
            <div className="flex flex-row items-center gap-1.5">
              <span className="w-4 border-t border-dashed border-vdcRed" />
              <h2 className="text-[10px] text-vdcRed">
                TIER AVG {tierAverage}
              </h2>
            </div>
          ) : null}
        </div>
        <div className="flex flex-row flex-wrap gap-1">
          {METRICS.map((metricOption) => (
            <button
              key={metricOption}
              type="button"
              onClick={() => setMetric(metricOption)}
              className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                metric === metricOption
                  ? "bg-vdcGreen text-vdcBlack border-vdcGreen hover:brightness-90"
                  : "border-vdcBlack/30 dark:border-vdcWhite/30 text-gray-500 dark:text-gray-400 hover:bg-vdcBlack/5 dark:hover:bg-vdcWhite/10 hover:text-vdcBlack dark:hover:text-vdcWhite"
              }`}
            >
              {TREND_METRIC_LABELS[metricOption]}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-3">
        {series.length >= 2 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 320, height: 192 }}
            >
              <LineChart
                data={series}
                margin={{ top: 6, right: 6, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="index"
                  tick={CHART_TICK_STYLE}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={48}
                  tickFormatter={(index: number) =>
                    series[index] ? shortDate(series[index].date) : ""
                  }
                />
                <YAxis
                  tick={CHART_TICK_STYLE}
                  domain={yDomain}
                  tickFormatter={(value: number) =>
                    String(Number(value.toFixed(2)))
                  }
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
                  labelStyle={{
                    color: "var(--color-vdcWhite)",
                    ...CHART_TOOLTIP_TEXT_STYLE,
                  }}
                  itemStyle={CHART_TOOLTIP_TEXT_STYLE}
                  labelFormatter={(label) => {
                    const point = series[Number(label)];
                    return point ? fullDate(point.date) : "";
                  }}
                  formatter={(value) => [
                    String(value ?? ""),
                    TREND_METRIC_LABELS[metric],
                  ]}
                />
                {tierAverage !== null ? (
                  <ReferenceLine
                    y={tierAverage}
                    stroke="var(--color-vdcRed)"
                    strokeDasharray="4 4"
                  />
                ) : null}
                {boundaries.map((boundary) => (
                  <ReferenceLine
                    key={boundary}
                    x={boundary}
                    stroke="currentColor"
                    strokeOpacity={0.35}
                    strokeDasharray="3 3"
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-vdcGreen)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <h2 className="text-xs text-gray-500 dark:text-gray-400 py-10 text-center">
            Not enough games to chart a trend.
          </h2>
        )}
      </div>
    </div>
  );
}
