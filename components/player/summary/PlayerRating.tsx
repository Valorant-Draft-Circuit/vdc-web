import { avg } from "@/lib/common/math";
import { ProcessedPlayerStat } from "./PlayerSummary";
import StatChips from "./StatChips";

export default function PlayerRating({
  stats,
}: {
  stats: ProcessedPlayerStat[];
}) {
  const ratingAttack = avg(stats.map((ps) => ps.ratingAttack)) || 0;
  const ratingDefense = avg(stats.map((ps) => ps.ratingDefense)) || 0;
  const overallRating = (ratingAttack + ratingDefense) / 2;

  const ratingChips: Array<[string, string]> = [
    ["OVERALL", overallRating.toFixed(2)],
    ["ATK", ratingAttack.toFixed(2)],
    ["DEF", ratingDefense.toFixed(2)],
  ];

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm italic">Rating</h1>
      </div>
      <div className="px-4 py-3 sm:p-6">
        <StatChips stats={ratingChips} className="grid grid-cols-3 gap-2" />
      </div>
    </div>
  );
}
