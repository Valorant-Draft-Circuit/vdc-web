"use client";

import { useState } from "react";
import Link from "next/link";

import ModLogTypePill from "./ModLogTypePill";
import ShowMoreButton from "./ShowMoreButton";
import { ActiveMapBanEntry } from "@/lib/queries/staff/mapBans";

const PAGE_SIZE = 5;

export default function ActiveMapBansPanel({
  entries,
}: {
  entries: ActiveMapBanEntry[];
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleEntries = entries.slice(0, visibleCount);
  const remaining = entries.length - visibleCount;

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-[10px] uppercase tracking-wider text-vdcRed">
        resolves as maps are played
      </h2>
      <h1 className="text-xl font-semibold text-vdcBlack dark:text-white">
        Active Map Bans
      </h1>

      {entries.length === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">No active map bans.</h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
          {visibleEntries.map((entry) => (
            <li key={entry.discordID} className="py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <ModLogTypePill type="MAP_BAN" />
                  {entry.playerIgn ? (
                    <Link
                      href={`/player/${encodeURIComponent(entry.playerIgn)}`}
                      className="truncate text-vdcBlue hover:opacity-80"
                    >
                      <h2>{entry.playerName}</h2>
                    </Link>
                  ) : (
                    <h2 className="truncate">{entry.playerName}</h2>
                  )}
                </div>
                <h2 className="shrink-0 text-xs font-semibold">
                  {entry.totalRemaining}{" "}
                  {entry.totalRemaining === 1 ? "map" : "maps"} remaining
                  {entry.paused ? " (paused)" : ""}
                </h2>
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {entry.bans.map((ban) => (
                  <h2
                    key={ban.logId}
                    className="truncate text-xs font-normal text-gray-400"
                  >
                    {ban.mapCount}-map ban · {ban.dateLabel} · by{" "}
                    {ban.moderatorName} · {ban.rulesLine}
                    {ban.reason ? ` - ${ban.reason}` : ""}
                  </h2>
                ))}
              </div>
            </li>
          ))}
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
