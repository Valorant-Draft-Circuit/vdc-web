import Link from "next/link";
import Image from "next/image";

import { AGENTURL } from "@/lib/common/constants/agents";
import type { GroupLeaderRow } from "@/lib/queries/pickems/getGroupLeaderboard";

type Props = {
  rows: GroupLeaderRow[];
  season: number;
  view: string;
};

const RANK_COLOR: Record<number, string> = {
  1: "#f1c40f",
  2: "#cdd2da",
  3: "#cd853f",
};

const HEADER_BASE =
  "sticky top-0 z-10 border-b border-gray-300 bg-gray-100 px-2.5 py-3 text-[10px] uppercase tracking-wide text-vdcGrey backdrop-blur-sm dark:border-gray-600 dark:bg-vdcBlack dark:text-gray-400";
const CELL_BASE = "border-b border-gray-200 px-2.5 py-2.5 dark:border-gray-600";

export default function GroupLeaderboardTable({ rows, season, view }: Props) {
  if (rows.length === 0) {
    return (
      <h2 className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
        No groups have been created this season yet.
      </h2>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-600">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={`${HEADER_BASE} text-left`}>#</th>
            <th className={`${HEADER_BASE} text-left`}>Group</th>
            <th className={`${HEADER_BASE} text-right`}>Avg pts</th>
            <th className={`${HEADER_BASE} text-right`}>Members</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const rank = index + 1;
            return (
              <tr
                key={row.groupId}
                className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <td
                  className={`${CELL_BASE} text-sm font-extrabold`}
                  style={{ color: RANK_COLOR[rank] }}
                >
                  <h1>{rank}</h1>
                </td>
                <td className={`${CELL_BASE} text-sm`}>
                  <Link
                    href={`/pickems/leaderboard?scope=group:${row.groupId}&season=${season}&view=${view}`}
                    className="flex items-center gap-2.5 transition-colors hover:cursor-pointer hover:text-vdcRed"
                  >
                    <div className="relative size-7 flex-none overflow-hidden rounded-lg">
                      <Image
                        src={AGENTURL(row.image)}
                        alt={row.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <h2>{row.name}</h2>
                  </Link>
                </td>
                <td
                  className={`${CELL_BASE} text-right text-[15px] font-extrabold`}
                >
                  <h2>{row.averagePoints.toFixed(1)}</h2>
                </td>
                <td
                  className={`${CELL_BASE} text-right text-sm text-vdcGrey dark:text-gray-400`}
                >
                  <h2>
                    {row.participantCount}/{row.memberCount}
                  </h2>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
