import type { PlayerAgentBreakdown } from "@/lib/queries/stats/getPlayerAgentBreakdown";

type Props = { entry: PlayerAgentBreakdown; variant?: "hero" | "standalone" };

export default function PerSidePanel({ entry, variant = "hero" }: Props) {
  const { averages, rounds, roundsWon } = entry;
  const roundsLost = rounds - roundsWon;
  const roundWinPct = rounds === 0 ? 0 : (roundsWon / rounds) * 100;

  const containerClasses =
    variant === "hero"
      ? "rounded-md bg-slate-100/40 dark:bg-vdcBlack/40 backdrop-blur-sm border border-black/5 dark:border-white/5 p-3"
      : "rounded-md bg-slate-100 dark:bg-vdcGrey p-4";

  return (
    <div className={containerClasses}>
      <h1 className="text-xs uppercase tracking-wider text-vdcBlack dark:text-gray-400 mb-3">
        Per-side performance
      </h1>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 ">
        <BigCell
          label="Attack"
          value={averages.ratingAttack.toFixed(2)}
          color="text-vdcRed"
        />
        <BigCell
          label="Defense"
          value={averages.ratingDefense.toFixed(2)}
          color="text-vdcBlue"
        />
        <SmallCell
          label="Rounds W-L"
          value={`${roundsWon}-${roundsLost}`}
        />
        <SmallCell
          label="Round W%"
          value={`${roundWinPct.toFixed(0)}%`}
        />
      </div>
    </div>
  );
}

function BigCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-xs tracking-wider text-vdcBlack dark:text-gray-400 mb-1">
        {label}
      </h1>
      <h2
        className={`text-3xl font-bold leading-none ${color ?? "text-vdcBlack dark:text-vdcWhite"}`}
      >
        {value}
      </h2>
    </div>
  );
}

function SmallCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <h1 className="text-xs tracking-wider text-vdcBlack dark:text-gray-400 mb-1">
        {label}
      </h1>
      <h2 className="text-lg text-vdcBlack dark:text-vdcWhite tabular-nums">
        {value}
      </h2>
    </div>
  );
}
