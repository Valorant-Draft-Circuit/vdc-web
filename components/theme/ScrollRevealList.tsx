"use client";

import { useState } from "react";

const INITIAL_VISIBLE_ROWS = 10;
const SHOW_MORE_STEP = 5;

export function ScrollRevealList({
  rows,
  className,
}: {
  rows: React.ReactNode[];
  className?: string;
}) {
  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_VISIBLE_ROWS);
  const visibleRows = rows.slice(0, visibleRowCount);
  const hasMoreRows = rows.length > visibleRowCount;

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
    <ul
      onScroll={revealMoreRowsAtListBottom}
      className={`overflow-y-auto ${className ?? ""}`}
    >
      {visibleRows}
    </ul>
  );
}
