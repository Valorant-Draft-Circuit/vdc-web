import Link from "next/link";
import { Tier } from "@prisma/client";
import type { LeaderRow } from "@/lib/queries/pickems/getLeaderboard";
import { formatPoints } from "@/lib/pickems/format";
import PlayerAvatar from "@/components/theme/PlayerAvatar";

type Props = {
  rows: LeaderRow[];
  season: number;
  accent: string;
  tier: Tier;
  boardTier: Tier | null;
};

export default function TopTenBoard({
  rows,
  season,
  accent,
  boardTier,
}: Props) {
  const showAllHref = boardTier
    ? `/pickems/leaderboard?season=${season}&view=${boardTier.toLowerCase()}`
    : `/pickems/leaderboard?season=${season}`;

  return (
    <div className="rounded-md border border-black/5 bg-vdcWhite/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-md font-bold uppercase tracking-wider text-vdcRed">
          Top 10
        </h1>
        <Link
          href={showAllHref}
          className="rounded-full border border-vdcRed px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-vdcRed transition-colors hover:bg-vdcRed hover:text-white"
        >
          <h2>Show all</h2>
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-vdcGrey dark:text-gray-400">
          No picks yet this season.
        </p>
      ) : (
        <ol className="flex flex-col gap-1">
          {rows.map((row, index) => {
            const rowTier = (boardTier ?? row.bestTier.tier).toLowerCase();
            return (
              <li key={row.userId}>
                <Link
                  href={`/pickems/picks/${row.userId}?tier=${rowTier}&season=${season}`}
                  className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <h2 className="w-5 flex-none text-center text-xs font-bold tabular-nums text-vdcGrey dark:text-gray-400">
                    {index + 1}
                  </h2>
                  <PlayerAvatar
                    name={row.name}
                    image={row.image}
                    fallbackColor={accent}
                    sizeClass="size-6"
                    pixels={24}
                    textClass="text-[10px]"
                    userId={row.userId}
                  />
                  <h2 className="flex-1 truncate text-sm">{row.name}</h2>
                  {boardTier === null && (
                    <h2 className="text-[10px] uppercase tracking-wide text-vdcGrey dark:text-gray-400">
                      {row.resolvedTiers}{" "}
                      {row.resolvedTiers === 1 ? "tier" : "tiers"}
                    </h2>
                  )}
                  <h2 className="text-sm font-bold tabular-nums">
                    {formatPoints(row.points)}
                  </h2>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
