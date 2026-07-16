import type { Insight, TrendDirection } from "@/lib/common/indepth";

const DIRECTION_ARROWS: Record<TrendDirection, string> = {
  up: "↑",
  down: "↓",
  steady: "→",
};

const DIRECTION_COLOR_CLASSES: Record<TrendDirection, string> = {
  up: "text-vdcGreen",
  down: "text-vdcRed",
  steady: "text-gray-500 dark:text-gray-400",
};

export default function ScoutInsights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
      {insights.map((insight) => (
        <div
          key={insight.key}
          className="bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm border-l-2 border-vdcRed rounded-md px-3 py-2"
        >
          <h1 className="text-md tracking-wide text-vdcRed">{insight.label}</h1>
          <div className="flex flex-col flex-wrap items-baseline gap-1 mt-0.5">
            <h1 className="text-sm">
              {insight.value}
              {insight.direction ? (
                <span
                  className={`ml-1 ${DIRECTION_COLOR_CLASSES[insight.direction]}`}
                >
                  {DIRECTION_ARROWS[insight.direction]}
                </span>
              ) : null}
            </h1>
            {insight.sub ? (
              <h2 className="text-xs text-gray-500 dark:text-gray-400">
                {insight.sub}
              </h2>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
