import Link from "next/link";
import { Tier } from "@prisma/client";
import type { SentimentSlate } from "@/lib/queries/pickems/getMatchSentiment";

export default function SlateSelector({
  slates,
  selectedMatchDay,
  tier,
  season,
}: {
  slates: SentimentSlate[];
  selectedMatchDay: number | null;
  tier: Tier;
  season: number;
}) {
  const tierSlug = tier.toLowerCase();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <h2 className="text-[11px] uppercase tracking-wide text-vdcGrey dark:text-gray-400">Slate</h2>
      {slates.map((slate) => {
        const isActive = slate.matchDay === selectedMatchDay;
        return (
          <Link
            key={slate.matchDay}
            href={`/pickems/sentiment?phase=matches&tier=${tierSlug}&season=${season}&md=${slate.matchDay}`}
            className={`rounded border px-2.5 py-1 text-[11px] font-bold transition-colors ${
              isActive
                ? "border-vdcRed bg-vdcRed text-white"
                : "border-gray-400 text-vdcGrey hover:border-vdcRed hover:text-vdcRed dark:border-gray-600 dark:text-gray-300"
            }`}
          >
            <h2>MD {slate.matchDay}</h2>
          </Link>
        );
      })}
    </div>
  );
}
