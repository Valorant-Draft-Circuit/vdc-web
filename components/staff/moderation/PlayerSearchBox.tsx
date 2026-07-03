"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@headlessui/react";

import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { MeiliPlayer } from "@/lib/types/meilisearch";

export default function PlayerSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MeiliPlayer[]>([]);

  const index = meilisearchClient.getIndex("players");

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    let cancelled = false;
    index
      .search(query.slice(0, 50), { limit: 10 })
      .then((res) => {
        if (cancelled) return;
        const hits = res.hits as MeiliPlayer[];
        const withIgn = hits.filter((hit) => hit.riotIGN);
        setResults(withIgn.slice(0, 5));
      })
      .catch(() => setResults([]));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function select(ign: string) {
    setQuery("");
    setResults([]);
    router.push(`/staff/moderation?player=${encodeURIComponent(ign)}`, {
      scroll: false,
    });
  }

  return (
    <div className="relative">
      <Input
        placeholder="Search player by IGN..."
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm focus:border-vdcRed focus:outline-none dark:border-gray-700 dark:bg-vdcBlack"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-vdcBlack">
          {results.map((player) => (
            <li key={player.id}>
              <button
                onClick={() => select(player.riotIGN)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 hover:cursor-pointer dark:hover:bg-vdcGrey"
              >
                <h2>{player.riotIGN}</h2>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
