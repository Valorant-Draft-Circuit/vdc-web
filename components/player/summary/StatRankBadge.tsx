import { ordinal } from "@/lib/common/indepth";
import type { StatRank } from "@/lib/common/match";

const MEDAL_CLASS_BY_RANK: Record<number, string> = {
  1: "bg-yellow-400 text-gray-900",
  2: "bg-gray-200 text-gray-900",
  3: "bg-amber-600",
};

export default function StatRankBadge({
  statRank,
}: {
  statRank: StatRank | null;
}) {
  if (!statRank) return null;

  const accentClass =
    MEDAL_CLASS_BY_RANK[statRank.rank] ?? "text-gray-200 bg-gray-500";
  return (
    <h2
      className={`${accentClass} leading-none rounded-2xl px-1.5 py-0.5 opacity-90 text-[8px]`}
    >
      {ordinal(statRank.rank)}
    </h2>
  );
}
