"use client";

import { useState } from "react";
import {
  transactionGroupHexColor,
  transactionGroupLabel,
} from "@/lib/common/transactions";
import { TransactionGroup } from "@/lib/queries/home/transactions";
import TransactionRowItem from "./TransactionRowItem";

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
        <h3 className="text-sm text-gray-500 dark:text-gray-400 py-1">
          No recent transactions
        </h3>
      ) : (
        <ul
          onScroll={revealMoreRowsAtListBottom}
          className="flex flex-col max-h-72 overflow-y-auto"
        >
          {visibleRows.map((row) => (
            <TransactionRowItem
              key={row.id}
              row={row}
              teamLinkTier={group.key.toLowerCase()}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
