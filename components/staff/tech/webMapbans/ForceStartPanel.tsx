"use client";

import { forceStartVeto } from "@/app/match/[matchId]/actions";
import { StartableMatch } from "@/lib/queries/staff/webMapbans";
import { format } from "date-fns";
import Link from "next/link";
import { useState, useTransition } from "react";

const VISIBLE_RESULT_LIMIT = 8;

export default function ForceStartPanel({
  matches,
}: {
  matches: StartableMatch[];
}) {
  const [search, setSearch] = useState("");
  const [armedMatchID, setArmedMatchID] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const query = search.trim().toLowerCase();
  const filtered =
    query.length === 0
      ? []
      : matches.filter(
          (match) =>
            match.homeName.toLowerCase().includes(query) ||
            match.awayName.toLowerCase().includes(query) ||
            match.tier.toLowerCase().includes(query) ||
            String(match.matchID).includes(query),
        );
  const visible = filtered.slice(0, VISIBLE_RESULT_LIMIT);

  const emptyMessage =
    matches.length === 0
      ? "No matches are missing a veto."
      : query.length === 0
        ? `Search ${matches.length} matches without a veto.`
        : "No matches match that search.";

  const handleStart = (matchID: number) => {
    if (armedMatchID !== matchID) {
      setError(null);
      setArmedMatchID(matchID);
      return;
    }
    startTransition(async () => {
      const result = await forceStartVeto(matchID);
      if (!result.ok) setError(result.error);
      setArmedMatchID(null);
    });
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-sm text-gray-500 dark:text-gray-300">
        Force Start a Veto
      </h2>
      <h2 className="text-xs text-gray-500">
        staff override: skips the 12h window and roster check
      </h2>

      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search team, tier, or match ID"
        className="mt-3 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-600"
      />

      {visible.length === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">{emptyMessage}</h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-700 dark:border-gray-700">
          {visible.map((match) => (
            <li
              key={match.matchID}
              className="flex flex-row items-center gap-2 py-1.5"
            >
              <Link
                href={`/match/${match.matchID}`}
                className="block min-w-0 flex-1 hover:bg-gray-50 dark:hover:bg-vdcBlack/40"
              >
                <div className="flex items-baseline gap-2 text-xs text-gray-400">
                  <h2>
                    {match.tier} · MD{match.matchDay ?? "?"} · #{match.matchID}
                  </h2>
                  <h2>{format(match.dateScheduled, "MMM d")}</h2>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <h2 className="text-vdcBlue">{match.homeName}</h2>
                  <h2 className="text-gray-400">v</h2>
                  <h2 className="text-vdcBlue">{match.awayName}</h2>
                </div>
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStart(match.matchID)}
                className="shrink-0 rounded-md border border-vdcRed/50 px-3 py-1 text-xs text-vdcRed hover:brightness-90 disabled:opacity-50 hover:cursor-pointer"
              >
                <h1>
                  {armedMatchID === match.matchID ? "Confirm start" : "Start"}
                </h1>
              </button>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > visible.length && (
        <h2 className="mt-2 text-xs text-gray-400">
          {filtered.length - visible.length} more, refine the search
        </h2>
      )}
      {error && <h2 className="mt-2 text-xs text-vdcRed">{error}</h2>}
    </div>
  );
}
