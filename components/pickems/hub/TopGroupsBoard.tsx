import Image from "next/image";
import Link from "next/link";
import { Tier } from "@prisma/client";
import { AGENTURL } from "@/lib/common/constants/agents";
import type { GroupLeaderRow } from "@/lib/queries/pickems/getGroupLeaderboard";

type Props = {
  rows: GroupLeaderRow[];
  season: number;
  boardTier: Tier | null;
};

export default function TopGroupsBoard({ rows, season, boardTier }: Props) {
  const viewParam = boardTier ? `&view=${boardTier.toLowerCase()}` : "";
  const showAllHref = `/pickems/leaderboard?season=${season}&scope=groups${viewParam}`;
  const groupHref = (groupId: number) =>
    `/pickems/leaderboard?season=${season}&scope=group:${groupId}${viewParam}`;

  return (
    <div className="rounded-md border border-black/5 bg-vdcWhite/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-md font-bold uppercase tracking-wider text-vdcRed">
          Top Groups
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
          No groups yet this season.
        </p>
      ) : (
        <ol className="flex flex-col gap-1">
          {rows.map((row, index) => (
            <li key={row.groupId}>
              <Link
                href={groupHref(row.groupId)}
                className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <h2 className="w-5 flex-none text-center text-xs font-bold tabular-nums text-vdcGrey dark:text-gray-400">
                  {index + 1}
                </h2>
                <span className="relative size-6 flex-none overflow-hidden rounded-full">
                  <Image
                    src={AGENTURL(row.image)}
                    alt={row.name}
                    fill
                    className="object-cover"
                  />
                </span>
                <h2 className="flex-1 truncate text-sm">{row.name}</h2>
                <h2 className="text-[10px] uppercase tracking-wide text-vdcGrey dark:text-gray-400">
                  {row.participantCount}/{row.memberCount} playing
                </h2>
                <h2 className="w-12 text-right text-sm font-bold tabular-nums">
                  {row.averagePoints.toFixed(1)}
                </h2>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
