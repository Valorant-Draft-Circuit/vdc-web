"use client";

import { useState } from "react";
import Link from "next/link";

import ModLogTypePill from "./ModLogTypePill";
import ShowMoreButton from "./ShowMoreButton";
import { SanctionEntry } from "@/lib/queries/staff/moderation";

const PAGE_SIZE = 5;

export default function ActiveSanctionsPanel({
  sanctions,
  showingBans,
}: {
  sanctions: SanctionEntry[];
  showingBans: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleSanctions = sanctions.slice(0, visibleCount);
  const remaining = sanctions.length - visibleCount;

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-[10px] uppercase tracking-wider text-vdcRed">
        {showingBans ? "all-time" : "auto-resolves on expiry"}
      </h2>
      <h1 className="text-xl font-semibold text-vdcBlack dark:text-white">
        {showingBans ? "Bans" : "Active Sanctions"}
      </h1>

      {sanctions.length === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">
          {showingBans ? "No bans logged." : "No active sanctions."}
        </h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
          {visibleSanctions.map((sanction) => (
            <li
              key={sanction.logId}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <ModLogTypePill type={sanction.type} />
                {sanction.playerIgn ? (
                  <Link
                    href={`/player/${encodeURIComponent(sanction.playerIgn)}`}
                    className="truncate text-vdcBlue hover:opacity-80"
                  >
                    <h2>{sanction.playerName}</h2>
                  </Link>
                ) : (
                  <h2 className="truncate">{sanction.playerName}</h2>
                )}
                <h2 className="hidden truncate text-xs text-gray-400 sm:block">
                  by {sanction.moderatorName}
                </h2>
                {sanction.postMortemUrl && (
                  <a
                    href={sanction.postMortemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs text-vdcBlue hover:opacity-80"
                  >
                    <h2>post mortem</h2>
                  </a>
                )}
              </div>
              <h2
                className={`shrink-0 text-xs ${
                  sanction.expiringSoon ? "text-vdcRed" : "text-gray-400"
                }`}
              >
                {sanction.dateLabel}
                {sanction.expiresLabel ? ` · ${sanction.expiresLabel}` : ""}
                {sanction.expiringSoon ? " · expiring soon" : ""}
              </h2>
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
