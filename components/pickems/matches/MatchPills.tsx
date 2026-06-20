"use client";

import { type CSSProperties } from "react";
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
        const pillStyle = { "--accent": accent } as CSSProperties;
        const selectedClasses = isSelected
          ? "text-white enabled:hover:brightness-95"
          : "border-gray-300 bg-transparent dark:border-gray-600 enabled:hover:border-[var(--accent)] enabled:hover:text-[var(--accent)]";
        const selectedStyle = isSelected
          ? { ...pillStyle, backgroundColor: accent, borderColor: accent }
          : pillStyle;
        return (
          <button
            key={`${score.home}-${score.away}`}
            type="button"
            disabled={locked}
            onClick={() => onPick(score)}
            className={`flex w-[46px] items-center justify-center rounded-md border px-0 py-1.5 text-sm font-bold transition-colors enabled:hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${selectedClasses}`}
            style={selectedStyle}
          >
            <h2>
              {score.home}-{score.away}
            </h2>
          </button>
        );
      })}
    </div>
  );
}
