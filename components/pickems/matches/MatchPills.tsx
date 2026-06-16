"use client";

import { MatchType } from "@prisma/client";
import { legalScores, type Score } from "@/lib/pickems/picks";

type Props = {
  matchType: MatchType;
  value?: Score;
  locked: boolean;
  accent: string;
  onPick: (score: Score) => void;
};

export default function MatchPills({
  matchType,
  value,
  locked,
  accent,
  onPick,
}: Props) {
  const scores = legalScores(matchType);

  return (
    <div className="flex gap-1">
      {scores.map((score) => {
        const isSelected =
          value !== undefined &&
          value.home === score.home &&
          value.away === score.away;
        const selectedClasses = isSelected
          ? "text-white"
          : "border-gray-300 bg-transparent dark:border-gray-600";
        const selectedStyle = isSelected
          ? { backgroundColor: accent, borderColor: accent }
          : undefined;
        return (
          <button
            key={`${score.home}-${score.away}`}
            type="button"
            disabled={locked}
            onClick={() => onPick(score)}
            className={`flex w-[46px] items-center justify-center rounded-md border px-0 py-1.5 text-sm font-bold enabled:hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${selectedClasses}`}
            style={selectedStyle}
          >
            <p>
              {score.home}-{score.away}
            </p>
          </button>
        );
      })}
    </div>
  );
}
