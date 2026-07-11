import type { LeaderRow } from "@/lib/queries/pickems/getLeaderboard";
import { formatPoints } from "@/lib/pickems/format";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";

type Props = {
  row: LeaderRow | null;
  rank: number | null;
  totalPlayers: number;
  loggedIn: boolean;
};

function HeroCell({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <h1
        className="text-2xl font-extrabold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </h1>
      <h2 className="text-[10px] uppercase tracking-wider text-vdcRed">
        {label}
      </h2>
    </div>
  );
}

export default function StandingHero({
  row,
  rank,
  totalPlayers,
  loggedIn,
}: Props) {
  const surface =
    "rounded-md border border-black/5 bg-vdcWhite/40 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40";

  if (!loggedIn || row === null || rank === null) {
    return (
      <div className={`${surface} px-6 py-8 text-center`}>
        <h1 className="text-sm font-bold">
          {loggedIn
            ? "Make picks to join the board"
            : "Log in to see your standing"}
        </h1>
        <h2 className="mt-1 text-xs text-vdcGrey dark:text-gray-400">
          {totalPlayers} players are on this season&apos;s board
        </h2>
      </div>
    );
  }

  const percentile = Math.max(1, Math.round((rank / totalPlayers) * 100));

  return (
    <div
      className={`${surface} flex flex-wrap items-center justify-around gap-x-4 gap-y-4 px-6 py-6`}
    >
      <HeroCell value={formatPoints(row.points)} label="Avg pts" />
      <HeroCell value={formatPoints(row.totalPoints)} label="Total pts" />
      <HeroCell
        value={row.bestTier.tier}
        label={`Best tier · ${formatPoints(row.bestTier.points)} pts`}
        accent={TIER_HEX_COLOR_MAP[row.bestTier.tier]}
      />
      <HeroCell value={`#${rank}`} label={`of ${totalPlayers} players`} />
      <HeroCell value={`Top ${percentile}%`} label="Overall" />
    </div>
  );
}
