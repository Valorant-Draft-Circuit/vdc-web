import Link from "next/link";
import { Tier } from "@prisma/client";
import type { LeaderRow } from "@/lib/queries/pickems/getLeaderboard";
import PlayerAvatar from "@/components/theme/PlayerAvatar";

type Props = {
  rows: LeaderRow[];
  season: number;
  accent: string;
  boardTier: Tier | null;
};

export default function AdminPicksBoard({
  rows,
  season,
  accent,
  boardTier,
}: Props) {
  return (
    <div className="rounded-md border border-black/5 bg-vdcWhite/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40">
      <h1 className="mb-3 text-md font-bold uppercase tracking-wider text-vdcRed">
        Admin Picks
      </h1>

      {rows.length === 0 ? (
        <h2 className="py-6 text-center text-sm text-vdcGrey dark:text-gray-400">
          No admins have made picks yet this season.
        </h2>
      ) : (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const rowTier = (boardTier ?? row.bestTier.tier).toLowerCase();
            return (
              <li key={row.userId}>
                <Link
                  href={`/pickems/picks/${row.userId}?tier=${rowTier}&season=${season}`}
                  className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5"
                >
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
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
