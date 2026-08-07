"use client";

import TeamMark from "@/components/pickems/common/TeamMark";
import type { BracketTeam } from "@/lib/common/bracket";

export type CardSide = {
  team: BracketTeam | null;
  value: string;
  isWinner: boolean;
  realScore: number | null;
};

type Props = {
  top: CardSide;
  bottom: CardSide;
  maxScore: number;
  editable: boolean;
  accent: string;
  pointsEarned: number | null;
  error: string | null;
  onChange?: (side: "top" | "bottom", value: string) => void;
};

function SideRow({
  side,
  maxScore,
  editable,
  accent,
  invalid,
  onChange,
}: {
  side: CardSide;
  maxScore: number;
  editable: boolean;
  accent: string;
  invalid: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-2 ${
        side.isWinner ? "bg-vdcRed/10" : ""
      }`}
    >
      <h2 className="w-4 flex-none text-center text-xs text-gray-500">
        {side.team?.seed ?? "-"}
      </h2>
      {side.team ? (
        <>
          <TeamMark
            logo={side.team.logo}
            slug={side.team.franchiseSlug}
            size="size-5"
          />
          <h2
            className={`flex-1 truncate text-xs font-bold uppercase tracking-wide ${
              side.isWinner ? "text-vdcRed" : ""
            }`}
          >
            {side.team.franchiseSlug}
          </h2>
        </>
      ) : (
        <>
          <span className="size-5 flex-none rounded bg-gray-200 dark:bg-gray-800" />
          <h2 className="flex-1 truncate text-xs text-gray-400">TBD</h2>
        </>
      )}
      {side.realScore !== null && (
        <h2 className="w-4 flex-none text-center text-xs font-bold text-gray-400">
          {side.realScore}
        </h2>
      )}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={maxScore}
        value={side.value}
        disabled={!editable || side.team === null}
        onChange={(event) => onChange?.(event.target.value)}
        aria-label={`${side.team?.franchiseSlug ?? "TBD"} series score`}
        aria-invalid={invalid}
        className={`h-7 w-8 flex-none rounded border bg-transparent text-center text-sm font-bold [appearance:textfield] focus:outline-none disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
          invalid
            ? "border-vdcRed"
            : "border-black/15 dark:border-white/15"
        }`}
        style={!invalid && side.isWinner ? { borderColor: accent } : undefined}
      />
    </div>
  );
}

export default function BracketCard({
  top,
  bottom,
  maxScore,
  editable,
  accent,
  pointsEarned,
  error,
  onChange,
}: Props) {
  const invalid = error !== null;
  return (
    <div className="relative rounded-lg border border-gray-200 bg-vdcWhite dark:border-gray-700 dark:bg-vdcGrey">
      {pointsEarned !== null && pointsEarned > 0 && (
        <h2 className="absolute -top-2 right-2 z-10 rounded bg-vdcGreen px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          +{pointsEarned}
        </h2>
      )}
      <SideRow
        side={top}
        maxScore={maxScore}
        editable={editable}
        accent={accent}
        invalid={invalid}
        onChange={(value) => onChange?.("top", value)}
      />
      <div className="border-t border-gray-200 dark:border-gray-700" />
      <SideRow
        side={bottom}
        maxScore={maxScore}
        editable={editable}
        accent={accent}
        invalid={invalid}
        onChange={(value) => onChange?.("bottom", value)}
      />
      {invalid && (
        <p className="px-2.5 pb-1.5 text-[10px] font-semibold text-vdcRed">
          {error}
        </p>
      )}
    </div>
  );
}

export function ByeCard({ team }: { team: BracketTeam }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 px-2.5 py-2 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <h2 className="w-4 flex-none text-center text-xs text-gray-500">
          {team.seed}
        </h2>
        <TeamMark logo={team.logo} slug={team.franchiseSlug} size="size-5" />
        <h2 className="flex-1 truncate text-xs font-bold uppercase tracking-wide">
          {team.franchiseSlug}
        </h2>
        <h2 className="text-[10px] uppercase tracking-wide text-gray-400">
          Bye
        </h2>
      </div>
    </div>
  );
}
