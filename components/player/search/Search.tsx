"use client";

import { TMeiliPlayer } from "@/app/api/internal/meilisearch/documents/players/route";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { Input } from "@headlessui/react";
import { useEffect, useState } from "react";
import PlayerCard from "./PlayerCard";

export default function Search({ mmrShow }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMeiliPlayer[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const index = meilisearchClient.getIndex("players");
  const LIMIT = 30;
  async function fetchPage(q: string, pageNumber: number) {
    setLoading(true);
    const offset = pageNumber * LIMIT;

    try {
      const res = await index.search(truncate(q, 50), {
        limit: LIMIT,
        offset,
      });

      const hits = res.hits as TMeiliPlayer[];
      if (pageNumber === 0) {
        setSearchResults(hits);
      } else {
        setSearchResults((prev) => [...prev, ...hits]);
      }

      if (hits.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Meilisearch error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchPage("", 0);
  }, []);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    void fetchPage(query, 0);
  }, [query]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchPage(query, nextPage);
  };

  return (
    <div className="flex flex-col m-auto">
      <div className="flex items-center justify-between mb-4 pt-8 pb-2 sticky top-14 z-10 bg-vdcWhite dark:bg-vdcBlack">
        <Input
          placeholder="Search players..."
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
          }}
          className="h-8 w-full rounded-md border px-2 text-sm focus:outline-none focus:ring focus:border-vdcRed bg-vdcWhite dark:bg-vdcBlack"
        />
      </div>

      <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {searchResults.length === 0 ? (
          <h1 className="text-center text-gray-500">No players found.</h1>
        ) : (
          searchResults.map((player) => {
            return (
              <PlayerCard key={player.id} player={player} mmrShow={mmrShow} />
            );
          })
        )}
      </div>

      <div className="mt-4 flex justify-center">
        {loading && page === 0 && <h1 className="text-vdcGrey">Loading...</h1>}
        {!loading && hasMore && searchResults.length > 0 && (
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-vdcRed text-white rounded-md hover:bg-red-700 disabled:bg-gray-300"
          >
            <h1>{loading ? "Loading…" : "Load more"}</h1>
          </button>
        )}
        {!hasMore && searchResults.length > 0 && (
          <h1 className="text-vdcGrey">End of results.</h1>
        )}
      </div>
    </div>
  );
}

function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }
  return text.substr(0, length) + "\u2026";
}
