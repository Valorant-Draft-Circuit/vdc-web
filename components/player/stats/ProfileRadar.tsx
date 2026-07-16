"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  RADAR_STATS,
  COMPARABLE_STAT_LABELS,
  LOWER_IS_BETTER,
  formatStatValue,
  ordinal,
  percentileAndRank,
  type AggregatedStats,
  type PeerRow,
} from "@/lib/common/indepth";
import {
  CHART_TICK_STYLE,
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_TEXT_STYLE,
} from "@/lib/common/constants/charts";

export default function ProfileRadar({
  agg,
  peers,
}: {
  agg: AggregatedStats;
  peers: PeerRow[];
}) {
  const axes = RADAR_STATS.map((stat) => {
    const dist = percentileAndRank(
      agg[stat],
      peers.map((peer) => peer.stats[stat]),
      LOWER_IS_BETTER.has(stat),
    );
    return {
      axis: COMPARABLE_STAT_LABELS[stat],
      percentile: dist?.percentile ?? 0,
      statValue: formatStatValue(stat, agg[stat]),
    };
  });

  const hasPeers = peers.length > 0;

  return (
    <div className="bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm rounded-md">
      <div className="px-4 pt-3">
        <h1 className="text-md tracking-wider text-vdcRed">Profile</h1>
      </div>
      <div className="px-4 py-3">
        {hasPeers ? (
          <div className="h-56 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 320, height: 224 }}
            >
              <RadarChart data={axes} outerRadius="70%">
                <PolarGrid stroke="currentColor" strokeOpacity={0.25} />
                <PolarAngleAxis dataKey="axis" tick={CHART_TICK_STYLE} />
                <PolarRadiusAxis
                  type="number"
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
                  labelStyle={{
                    color: "var(--color-vdcWhite)",
                    ...CHART_TOOLTIP_TEXT_STYLE,
                  }}
                  itemStyle={CHART_TOOLTIP_TEXT_STYLE}
                  formatter={(value, _name, item) => {
                    const datum = (
                      item as { payload?: { statValue?: string; axis?: string } }
                    ).payload;
                    const percentileNote = `${ordinal(Number(value ?? 0))} pct`;
                    return [
                      `${datum?.statValue ?? ""} · ${percentileNote}`,
                      datum?.axis ?? "",
                    ];
                  }}
                  labelFormatter={() => ""}
                />
                <Radar
                  dataKey="percentile"
                  isAnimationActive={false}
                  stroke="var(--color-vdcGreen)"
                  fill="var(--color-vdcGreen)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <h2 className="text-xs text-gray-500 dark:text-gray-400 py-10 text-center">
            Not enough peers to compare.
          </h2>
        )}
        <h2 className="text-xs font-normal text-gray-500 dark:text-gray-400 text-center mt-1">
          Percentile VS Current peer group
        </h2>
      </div>
    </div>
  );
}
