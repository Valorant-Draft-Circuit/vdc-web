"use client";

import TeamMark from "@/components/pickems/common/TeamMark";
import type { BracketTeam } from "@/lib/common/bracket";

export type CardMode = "edit" | "pending" | "result";

export type CardSide = {
  team: BracketTeam | null;
  value: string;
  isWinner: boolean;
  realScore: number | null;
  isWrongPick: boolean;
};

type Props = {
  top: CardSide;
  bottom: CardSide;
  maxScore: number;
  mode: CardMode;
  accent: string;
  pointsEarned: number | null;
  outcome: "correct" | "wrong" | null;
  pickedNote: string | null;
  error: string | null;
  onChange?: (side: "top" | "bottom", value: string) => void;
};

function rowTone(side: CardSide, mode: CardMode): string {
  if (mode === "result") {
    if (side.isWinner) return "bg-vdcGreen/10";
    if (side.isWrongPick) return "bg-vdcRed/10";
    return "";
  }
  return side.isWinner ? "bg-vdcRed/10" : "";
}

function nameTone(side: CardSide, mode: CardMode): string {
  if (mode === "result") {
    if (side.isWinner) return "text-vdcGreen";
    if (side.isWrongPick) return "text-vdcRed line-through";
    return "";
  }
  return side.isWinner ? "text-vdcRed" : "";
}

function SideRow({
  side,
  maxScore,
  mode,
  accent,
  invalid,
  onChange,
}: {
  side: CardSide;
  maxScore: number;
  mode: CardMode;
  accent: string;
  invalid: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 ${rowTone(side, mode)}`}>
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
            className={`flex-1 truncate text-xs font-bold uppercase tracking-wide ${nameTone(side, mode)}`}
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
      {mode === "result" ? (
        <h2
          className={`w-5 flex-none text-center text-sm font-bold ${
            side.isWinner ? "text-vdcGreen" : "text-gray-400"
          }`}
        >
          {side.realScore ?? "-"}
        </h2>
      ) : mode === "pending" ? (
        <h2 className="w-5 flex-none text-center text-sm font-bold text-gray-400">
          {side.value === "" ? "-" : side.value}
        </h2>
      ) : (
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={maxScore}
          value={side.value}
          disabled={side.team === null}
          onChange={(event) => onChange?.(event.target.value)}
          aria-label={`${side.team?.franchiseSlug ?? "TBD"} series score`}
          aria-invalid={invalid}
          className={`h-7 w-8 flex-none rounded border bg-transparent text-center text-sm font-bold [appearance:textfield] focus:outline-none disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            invalid ? "border-vdcRed" : "border-black/15 dark:border-white/15"
          }`}
          style={!invalid && side.isWinner ? { borderColor: accent } : undefined}
        />
      )}
    </div>
  );
}

export default function BracketCard({
  top,
  bottom,
  maxScore,
  mode,
  accent,
  pointsEarned,
  outcome,
  pickedNote,
  error,
  onChange,
}: Props) {
  const invalid = error !== null;
  return (
    <div className="relative rounded-lg border border-gray-200 bg-vdcWhite dark:border-gray-700 dark:bg-vdcGrey">
      {outcome === "correct" && pointsEarned !== null && pointsEarned > 0 ? (
        <h2 className="absolute -top-2 right-2 z-10 rounded bg-vdcGreen px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          +{pointsEarned}
        </h2>
      ) : null}
      {outcome === "wrong" ? (
        <h2 className="absolute -top-2 right-2 z-10 rounded bg-vdcRed px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          Wrong
        </h2>
      ) : null}
      <SideRow
        side={top}
        maxScore={maxScore}
        mode={mode}
        accent={accent}
        invalid={invalid}
        onChange={(value) => onChange?.("top", value)}
      />
      <div className="border-t border-gray-200 dark:border-gray-700" />
      <SideRow
        side={bottom}
        maxScore={maxScore}
        mode={mode}
        accent={accent}
        invalid={invalid}
        onChange={(value) => onChange?.("bottom", value)}
      />
      {pickedNote ? (
        <h2 className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-vdcRed">
          Picked {pickedNote}
        </h2>
      ) : null}
      {invalid ? (
        <h2 className="px-2.5 pb-1.5 text-[10px] font-semibold text-vdcRed">
          {error}
        </h2>
      ) : null}
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
