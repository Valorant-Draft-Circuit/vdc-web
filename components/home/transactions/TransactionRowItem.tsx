import Link from "next/link";
import {
  STINT_ENDED_COLOR_MAP,
  STINT_ENDED_LABELS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLOR_MAP,
} from "@/lib/common/constants/transactions";
import { RecentTransactionRow } from "@/lib/queries/home/transactions";
import TeamLogo from "../recap/TeamLogo";

export default function TransactionRowItem({
  row,
  teamLinkTier,
}: {
  row: RecentTransactionRow;
  teamLinkTier: string | null;
}) {
  return (
    <li className="flex flex-col gap-1 py-2 text-xs border-b border-vdcBlack/5 dark:border-vdcWhite/5 last:border-b-0">
      <h2
        className={`self-start rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${pillColorClass(row)}`}
      >
        {pillLabel(row)}
      </h2>
      <div className="flex items-center gap-2">
        <h2 className="truncate">
          {row.playerIgn ? (
            <Link
              href={`/player/${encodeURIComponent(row.playerIgn)}`}
              className="hover:text-vdcRed"
            >
              {row.label}
            </Link>
          ) : (
            row.label
          )}
        </h2>
        {teamLinkTier && (
          <div className="ml-auto flex-none">
            {row.franchiseSlug && row.teamName ? (
              <Link
                href={`/franchises/${row.franchiseSlug}?team=${teamLinkTier}`}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-vdcRed"
              >
                <TeamLogo logo={row.teamLogo} teamName={row.teamName} />
                <h2 className="text-xs">{row.teamName}</h2>
              </Link>
            ) : (
              <div className="flex items-center gap-1">
                <TeamLogo logo={row.teamLogo} teamName={row.teamName} />
                {row.teamName && (
                  <h2 className="text-xs text-gray-600 dark:text-gray-400">
                    {row.teamName}
                  </h2>
                )}
              </div>
            )}
          </div>
        )}
        <h2
          className={`text-sm text-gray-500 flex-none w-7 text-right ${teamLinkTier ? "" : "ml-auto"}`}
        >
          {row.dateLabel}
        </h2>
      </div>
    </li>
  );
}

function pillLabel(row: RecentTransactionRow): string {
  if (row.stintEnded) {
    return STINT_ENDED_LABELS[row.type] ?? TRANSACTION_TYPE_LABELS[row.type];
  }
  return TRANSACTION_TYPE_LABELS[row.type];
}

function pillColorClass(row: RecentTransactionRow): string {
  if (row.stintEnded) {
    return (
      STINT_ENDED_COLOR_MAP[row.type] ?? TRANSACTION_TYPE_COLOR_MAP[row.type]
    );
  }
  return TRANSACTION_TYPE_COLOR_MAP[row.type];
}
