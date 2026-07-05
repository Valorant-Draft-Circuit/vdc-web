import Link from "next/link";
import { Tier } from "@prisma/client";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { VDC_RED } from "@/lib/common/constants/colors";

type Props = {
  tier: Tier;
  season: number;
  boardTier: Tier | null;
};

const PILL_BASE =
  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors";

function ScopePill({
  label,
  href,
  active,
  color,
}: {
  label: string;
  href: string;
  active: boolean;
  color: string;
}) {
  if (active) {
    return (
      <span
        className={`${PILL_BASE} text-white`}
        style={{ backgroundColor: color }}
      >
        <h2>{label}</h2>
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`${PILL_BASE} text-vdcGrey hover:text-vdcBlack dark:text-gray-400 dark:hover:text-vdcWhite`}
    >
      <h2>{label}</h2>
    </Link>
  );
}

export default function BoardScopePills({ tier, season, boardTier }: Props) {
  const baseHref = `/pickems?tier=${tier.toLowerCase()}&season=${season}`;
  return (
    <div className="flex flex-wrap items-center gap-1">
      <ScopePill
        label="Overall"
        href={baseHref}
        active={boardTier === null}
        color={VDC_RED}
      />
      {TIERS_LIST.map((boardOption) => (
        <ScopePill
          key={boardOption}
          label={boardOption}
          href={`${baseHref}&board=${boardOption.toLowerCase()}`}
          active={boardTier === boardOption}
          color={TIER_HEX_COLOR_MAP[boardOption]}
        />
      ))}
    </div>
  );
}
