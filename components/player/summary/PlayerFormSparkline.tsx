"use client";

import { useState } from "react";

export type SparklinePoint = {
  value: number;
  date: Date | string;
};

type Props = {
  label: string;
  color: string;
  points: SparklinePoint[];
  latest: string;
  decimals: number;
};

const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 24;
const TOP_PADDING = 2;
const BOTTOM_PADDING = 2;

export default function PlayerFormSparkline({
  label,
  color,
  points,
  latest,
  decimals,
}: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const coords = computeCoords(points.map((p) => p.value));
  const polyline = coords
    .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  const hovered =
    hoveredIndex !== null && hoveredIndex < points.length
      ? { point: points[hoveredIndex], coord: coords[hoveredIndex] }
      : null;

  return (
    <div className="flex flex-row items-center gap-2">
      <h1 className="text-xs text-vdcRed w-12">{label}</h1>
      <div className="relative flex-1">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-6 overflow-visible"
        >
          {coords.length >= 2 && (
            <polyline
              points={polyline}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
            />
          )}
          {coords.map((coord, i) => (
            <g key={i}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r={hoveredIndex === i ? 3 : 1.75}
                fill={color}
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={8}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}
        </svg>
        {hovered && (
          <SparklineTooltip
            value={hovered.point.value.toFixed(decimals)}
            date={formatDate(hovered.point.date)}
            xPercent={(hovered.coord.x / VIEW_WIDTH) * 100}
          />
        )}
      </div>
      <h2 className="text-xs w-10 text-right">{latest}</h2>
    </div>
  );
}

function SparklineTooltip({
  value,
  date,
  xPercent,
}: {
  value: string;
  date: string;
  xPercent: number;
}) {
  return (
    <div
      className="absolute -top-9 z-10 -translate-x-1/2 flex flex-row items-baseline gap-1 px-2 py-1 rounded-sm bg-vdcBlack text-vdcWhite text-[10px] whitespace-nowrap pointer-events-none shadow-md"
      style={{ left: `${xPercent}%` }}
    >
      <h2 className="font-bold">{value}</h2>
      <h2 className="text-gray-400">· {date}</h2>
    </div>
  );
}

function computeCoords(values: number[]): { x: number; y: number }[] {
  if (values.length === 0) return [];
  if (values.length === 1) {
    return [{ x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 }];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerHeight = VIEW_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const stepX = VIEW_WIDTH / (values.length - 1);
  return values.map((value, index) => {
    const x = index * stepX;
    const y =
      VIEW_HEIGHT - BOTTOM_PADDING - ((value - min) / range) * innerHeight;
    return { x, y };
  });
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", { month: "short", day: "2-digit" });
}
