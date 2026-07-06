"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLOR_MAP,
} from "@/lib/common/constants/transactions";
import {
  transactionGroupHexColor,
  transactionGroupLabel,
} from "@/lib/common/transactions";
import {
  RecentTransactionRow,
  TransactionGroup,
} from "@/lib/queries/home/transactions";
import TeamLogo from "../recap/TeamLogo";

const INITIAL_VISIBLE_ROWS = 10;
const SHOW_MORE_STEP = 5;

export default function TransactionGroupCard({
  group,
}: {
  group: TransactionGroup;
}) {
  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_VISIBLE_ROWS);
  const accentColor = transactionGroupHexColor(group.key);
  const visibleRows = group.rows.slice(0, visibleRowCount);
  const hasMoreRows = group.rows.length > visibleRowCount;

  function revealMoreRowsAtListBottom(event: React.UIEvent<HTMLUListElement>) {
    if (!hasMoreRows) return;
    const list = event.currentTarget;
    const reachedBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 8;
    if (reachedBottom) {
      setVisibleRowCount((count) => count + SHOW_MORE_STEP);
    }
  }

  return (
    <div
      className="rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-3 border-t-2"
      style={{ borderTopColor: accentColor }}
    >
      <h1
        className="text-md tracking-wider font-semibold mb-1"
        style={{ color: accentColor }}
      >
        {transactionGroupLabel(group.key)}
      </h1>
      {group.rows.length === 0 ? (
        <h3 className="text-xs text-gray-500 dark:text-gray-400 py-1">
          No recent transactions
        </h3>
      ) : (
        <ul
          onScroll={revealMoreRowsAtListBottom}
          className="flex flex-col max-h-32 overflow-y-auto"
        >
          {visibleRows.map((row) => (
            <TransactionRowItem key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TransactionRowItem({ row }: { row: RecentTransactionRow }) {
  return (
    <li className="flex items-center gap-2 py-1 text-xs border-b border-vdcBlack/5 dark:border-vdcWhite/5 last:border-b-0">
      <h2
        className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider flex-none ${TRANSACTION_TYPE_COLOR_MAP[row.type]}`}
      >
        {TRANSACTION_TYPE_LABELS[row.type]}
      </h2>
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
      <div className="ml-auto flex items-center gap-1 flex-none">
        <TeamLogo logo={row.teamLogo} teamName={row.teamName} />
        {row.teamName && (
          <h3 className="text-[10px] text-gray-600 dark:text-gray-400">
            {row.teamName}
          </h3>
        )}
      </div>
      <h3 className="text-[9px] text-gray-500 flex-none w-7 text-right">
        {row.dateLabel}
      </h3>
    </li>
  );
}
