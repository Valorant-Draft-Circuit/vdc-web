"use client";

import { TMeiliPlayer } from "@/app/api/internal/meilisearch/documents/players/route";
import {
  STATUS_LABELS,
  TEAM_LOGOS_URL,
  TIER_COLOR_MAP,
} from "@/lib/common/constants";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { Input } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const ImageWithFallback = (props) => {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...rest}
      alt=""
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }
  return text.substr(0, length) + "\u2026";
}
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
              <Link
                key={player.id}
                href={`/player/${player.discordId}`}
                className="flex flex-row h-24 w-96 items-center gap-2 p-4 text-xs rounded-xl hover:scale-102 transition-all duration-100 ease-in-out bg-gradient-to-tl text-vdcWhite from-vdcGrey to-vdcBlack drop-shadow-md"
              >
                <ImageWithFallback
                  src={player.image}
                  fallbackSrc={"/vdc-flame.svg"}
                  className="size-fit rounded-full object-cover text-vdcWhite dark:text-vdcBlack overflow-hidden"
                  alt={`${player.discordName} avatar`}
                  width={50}
                  height={50}
                />

                <div className="flex-1">
                  <h1>{player.discordName}</h1>
                  <h1>{STATUS_LABELS[player.leagueStatus]}</h1>
                  <h1 className={`text-${TIER_COLOR_MAP[player.tier]}`}>
                    {player.tier}
                  </h1>

                  {player.teamName && (
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-2">
                        <h1 className="truncate max-w-30 text-center my-auto">
                          {player.franchiseSlug} | {player.teamName}
                        </h1>
                        {player.franchiseLogo && (
                          <Image
                            src={`${TEAM_LOGOS_URL}${player.franchiseLogo}`}
                            alt={`${player.teamName} logo`}
                            width={100}
                            height={100}
                            className="size-5"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {player.riotIGN && (
                  <div className="text-right">
                    <h1>{player.riotIGN}</h1>
                    {mmrShow && player.mmrEffective && (
                      <h1>MMR: {player.mmrEffective}</h1>
                    )}
                  </div>
                )}
              </Link>
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
