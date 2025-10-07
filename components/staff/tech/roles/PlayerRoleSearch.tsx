"use client";

import { TMeiliPlayer } from "@/app/api/internal/meilisearch/documents/players/route";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { Input } from "@headlessui/react";
import { useEffect, useState } from "react";
import PlayerRolesCard from "./PlayerRolesCard";

export default function PlayerRoleSearch() {
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
      setHasMore(hits.length === LIMIT);
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
    if (query.trim() === "") {
      setSearchResults([]);
      setHasMore(false);
      return;
    }

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
      <div className="flex flex-col items-center justify-between bg-vdcWhite dark:bg-vdcBlack mb-4 sticky top-0 z-10">
        <Input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          className="h-8 w-full rounded-md border px-2 text-sm focus:outline-none focus:ring focus:border-vdcRed bg-vdcWhite dark:bg-vdcBlack"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 w-full  mx-auto">
        {query.trim() === "" ? (
          <div className="col-span-full flex items-center justify-center">
            <h1 className="text-center text-gray-500">
              Type a name to search for a user.
            </h1>
          </div>
        ) : searchResults.length === 0 && !loading ? (
          <h1 className="text-center text-gray-500">No users found.</h1>
        ) : (
          searchResults.map((user) => (
            <PlayerRolesCard key={user.id} user={user} />
          ))
        )}
      </div>

      <div className="mt-4 flex justify-center">
        {loading && page === 0 && <h1 className="text-vdcGrey">Loading...</h1>}
        {!loading && hasMore && searchResults.length > 0 && (
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-vdcRed text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 hover:cursor-pointer"
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
  return text.length <= length ? text : text.substr(0, length) + "\u2026";
}
