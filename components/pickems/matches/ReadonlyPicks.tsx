import Image from "next/image";
import ResultSlateGrid from "@/components/pickems/matches/ResultSlateGrid";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import type {
  ReadonlyAdvance,
  ReadonlySlate,
} from "@/lib/queries/pickems/getReadonlyPicks";

type Props = {
  slates: ReadonlySlate[];
  advance: ReadonlyAdvance | null;
  accent: string;
  tier: string;
  section: "matches" | "advancement";
};

function chipClass(status: ReadonlyAdvance["chips"][number]["status"]): string {
  if (status === "exact") {
    return "border-vdcGreen bg-vdcGreen/15";
  }
  if (status === "made") {
    return "border-vdcGreen";
  }
  if (status === "miss") {
    return "border-vdcRed opacity-70";
  }
  return "border-gray-300 dark:border-gray-600";
}

export default function ReadonlyPicks({
  slates,
  advance,
  accent,
  tier,
  section,
}: Props) {
  if (section === "advancement") {
    if (!advance) {
      return (
        <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
          This player has no advancement picks for this tier.
        </p>
      );
    }
    return (
      <div className="rounded-xl border border-black/10 bg-gray-100 px-3.5 py-3 dark:border-white/10 dark:bg-vdcGrey">
        <h2 className="mb-2 text-xs font-normal uppercase tracking-wide text-vdcGrey dark:text-gray-400">
          Advancement &middot; {tier}{" "}
          {advance.resolved ? `${advance.points} pts` : "pending results"}
        </h2>
        <div
          className="grid justify-center gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.ceil(advance.chips.length / 2)}, minmax(0, 14rem))`,
          }}
        >
          {advance.chips.map((chip) => {
            const isPending = chip.status === "pending";
            const pendingStyle = isPending
              ? { borderColor: accent, backgroundColor: `${accent}2e` }
              : undefined;
            return (
              <div
                key={chip.teamId}
                className={`relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] p-3 text-center text-[11px] font-bold ${isPending ? "" : chipClass(chip.status)}`}
                style={pendingStyle}
              >
                <h1 className="absolute left-2 top-1 text-base font-extrabold leading-none text-vdcGrey dark:text-gray-400">
                  {chip.seed}
                </h1>
                {chip.logo && (
                  <div className="relative aspect-square w-1/2">
                    <Image
                      src={`${TEAM_LOGOS_URL}${chip.logo}`}
                      alt={chip.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <h2 className="line-clamp-2 leading-tight">{chip.name}</h2>
              </div>
            );
          })}
        </div>
        {advance.resolved && (
          <p className="mt-2 text-[10px] text-vdcGrey dark:text-gray-400">
            Green = made the cutoff &middot; filled green = exact seed &middot;
            red = missed. (+2 each in cutoff, +1 exact seed)
          </p>
        )}
      </div>
    );
  }

  if (slates.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
        No match picks to show yet. They appear once a slate locks.
      </p>
    );
  }

  return <ResultSlateGrid slates={slates} accent={accent} />;
}
