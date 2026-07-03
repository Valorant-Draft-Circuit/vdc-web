"use client";

import { useState } from "react";

import ShowMoreButton from "./ShowMoreButton";
import { MOD_LOG_TYPE_ORDER } from "@/lib/common/constants/modLogs";
import { ModeratorActivityEntry } from "@/lib/queries/staff/moderation";

const PAGE_SIZE = 5;

export default function ModeratorActivityPanel({
  activity,
}: {
  activity: ModeratorActivityEntry[];
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleActivity = activity.slice(0, visibleCount);
  const remaining = activity.length - visibleCount;

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-[10px] uppercase tracking-wider text-vdcRed">
        Accountability · All-time
      </h2>
      <h1 className="text-xl font-semibold text-vdcBlack dark:text-white">
        Moderator Activity
      </h1>

      {activity.length === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">No mod actions logged.</h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
          {visibleActivity.map((entry) => {
            const breakdownParts: string[] = [];
            for (const type of MOD_LOG_TYPE_ORDER) {
              const count = entry.countsByType[type];
              if (count) {
                breakdownParts.push(
                  `${count} ${type.replaceAll("_", " ").toLowerCase()}`,
                );
              }
            }
            return (
              <li
                key={entry.moderatorName}
                className="flex items-center justify-between gap-3 py-2"
              >
                <h2 className="truncate">{entry.moderatorName}</h2>
                <h2 className="shrink-0 text-xs text-gray-400">
                  {entry.total} actions · {breakdownParts.join(" · ")}
                </h2>
              </li>
            );
          })}
        </ul>
      )}

      <ShowMoreButton
        remaining={remaining}
        pageSize={PAGE_SIZE}
        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
      />
    </div>
  );
}
