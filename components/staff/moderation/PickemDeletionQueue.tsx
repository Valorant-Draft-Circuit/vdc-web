"use client";

import { useState, useTransition } from "react";

import { saveDeletionQueue } from "@/app/staff/moderation/actions";
import { PickemDeletionEntry } from "@/lib/queries/staff/moderation";

export default function PickemDeletionQueue({
  entries,
}: {
  entries: PickemDeletionEntry[];
}) {
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingEntries = entries.filter((entry) => !entry.actioned);

  const dirtyChanges: { logId: number; actioned: boolean }[] = [];
  for (const entry of pendingEntries) {
    const isChecked = overrides[entry.logId] ?? entry.actioned;
    if (isChecked !== entry.actioned) {
      dirtyChanges.push({ logId: entry.logId, actioned: isChecked });
    }
  }

  function toggle(entry: PickemDeletionEntry) {
    setOverrides((prev) => {
      const isChecked = prev[entry.logId] ?? entry.actioned;
      return { ...prev, [entry.logId]: !isChecked };
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveDeletionQueue(dirtyChanges);
      if (!result.ok) {
        setError(result.error);
      } else {
        setOverrides({});
      }
    });
  }

  return (
    <div className="rounded-xl border border-vdcRed/40 bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-[10px] uppercase tracking-wider text-vdcRed">
        needs punishment follow-up
      </h2>
      <h1 className="text-xl font-semibold text-vdcBlack dark:text-white">
        Pick&apos;Ems Group Deletion
      </h1>

      {pendingEntries.length === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">
          No deletions awaiting follow-up.
        </h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
          {pendingEntries.map((entry) => (
            <li
              key={entry.logId}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="min-w-0">
                <h2 className="truncate">
                  {entry.playerName}
                  {entry.groupName ? ` · group "${entry.groupName}"` : ""}
                </h2>
                {entry.groupName === null && (
                  <h2 className="truncate text-xs text-gray-400">
                    {entry.rawMessage}
                  </h2>
                )}
                <h2 className="text-xs text-gray-400">
                  deleted by {entry.deletedByName} · {entry.dateLabel}
                </h2>
              </div>
              <label className="flex shrink-0 items-center gap-2 hover:cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrides[entry.logId] ?? entry.actioned}
                  onChange={() => toggle(entry)}
                  className="size-4 accent-vdcRed"
                />
                <h1 className="text-xs text-gray-400">actioned</h1>
              </label>
            </li>
          ))}
        </ul>
      )}

      {error && <h2 className="mt-2 text-sm text-vdcRed">{error}</h2>}

      {pendingEntries.length > 0 && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={save}
            disabled={dirtyChanges.length === 0 || isPending}
            className="rounded-md bg-vdcRed px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-500 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <h1>{isPending ? "Saving..." : "Save"}</h1>
          </button>
        </div>
      )}
    </div>
  );
}
