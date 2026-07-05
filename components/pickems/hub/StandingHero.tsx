import type { LeaderRow } from "@/lib/queries/pickems/getLeaderboard";

type Props = {
  row: LeaderRow | null;
  rank: number | null;
  totalPlayers: number;
  loggedIn: boolean;
};

function HeroCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <h1 className="text-2xl font-extrabold tabular-nums">{value}</h1>
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
    <div className={`${surface} flex items-center justify-around px-6 py-6`}>
      <HeroCell value={String(row.points)} label="Total pts" />
      <HeroCell value={`#${rank}`} label={`of ${totalPlayers} players`} />
      <HeroCell value={`Top ${percentile}%`} label="Overall" />
    </div>
  );
}
