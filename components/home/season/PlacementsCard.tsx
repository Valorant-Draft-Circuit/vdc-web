import Link from "next/link";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import { PlayoffPlacement } from "@/lib/queries/home/seasonSummary";
import TeamLogo from "../recap/TeamLogo";

type Props = {
  placements: PlayoffPlacement[];
  showTierDots: boolean;
};

const PLACEMENT_LABELS: Record<number, string> = {
  1: "Champion",
  2: "Runner-up",
  3: "Semifinalist",
  4: "Semifinalist",
};

const PLACEMENT_ACCENTS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-slate-400",
  3: "text-amber-700",
  4: "text-amber-700",
};

export default function PlacementsCard({ placements, showTierDots }: Props) {
  const heading = showTierDots ? "Champions" : "Playoff Results";

  return (
    <div className="flex min-h-96 flex-col gap-2 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-4">
      <h2 className="text-md tracking-wider uppercase text-vdcRed font-semibold">
        {heading}
      </h2>
      {placements.length === 0 ? (
        <h1 className="text-sm text-gray-600 dark:text-gray-300">
          No playoff results yet.
        </h1>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {placements.map((placement) => (
            <PlacementRow
              key={`${placement.tier}-${placement.rank}`}
              placement={placement}
              showTierDots={showTierDots}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlacementRow({
  placement,
  showTierDots,
}: {
  placement: PlayoffPlacement;
  showTierDots: boolean;
}) {
  const tierColor = TIER_HEX_COLOR_MAP[placement.tier];
  const subtitle = showTierDots ? placement.tier : `Seed ${placement.seed}`;

  return (
    <Link
      href={`/franchises/${placement.franchiseSlug}`}
      className="flex flex-1 items-center gap-3 rounded-md bg-slate-100/60 dark:bg-vdcBlack/60 backdrop-blur-[1px] px-3 py-2 hover:cursor-pointer hover:brightness-95"
    >
      {showTierDots ? (
        <span
          className="size-2.5 flex-none rounded-full"
          style={{ backgroundColor: tierColor }}
        />
      ) : (
        <h2
          className={`w-24 flex-none whitespace-nowrap text-xs font-bold uppercase ${
            PLACEMENT_ACCENTS[placement.rank] ?? "text-gray-500"
          }`}
        >
          {PLACEMENT_LABELS[placement.rank] ?? `${placement.rank}th`}
        </h2>
      )}
      <TeamLogo
        logo={placement.teamLogo}
        teamName={placement.teamName}
        sizeClass="size-10"
      />
      <div className="flex flex-col">
        <h1 className="font-bold text-vdcBlack dark:text-vdcWhite">
          {placement.teamName}
        </h1>
        <h2
          className="text-xs uppercase tracking-wider font-semibold"
          style={{ color: tierColor }}
        >
          {subtitle}
        </h2>
      </div>
    </Link>
  );
}
