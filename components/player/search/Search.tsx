"use client";

import { TMeiliPlayer } from "@/app/api/internal/meilisearch/documents/players/route";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { Input } from "@headlessui/react";
import Image from "next/image";
import { useEffect, useState } from "react";

function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }

  return text.substr(0, length) + "\u2026";
}
export default function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMeiliPlayer[]>([]);
  const index = meilisearchClient.getIndex("players");
  async function searchPlayers(q: string) {
    try {
      const res = await index.search(truncate(q, 50));
      setSearchResults(res.hits as TMeiliPlayer[]);
    } catch (err) {
      console.error("Meilisearch error:", err);
      setSearchResults([]);
    }
  }

  useEffect(() => {
    void searchPlayers("");
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Search Input */}
      <div className="flex items-center justify-between mb-4 py-4">
        <Input
          placeholder="Search players..."
          value={query}
          onChange={(event) => {
            const v = event.currentTarget.value;
            setQuery(v);
            void searchPlayers(v);
          }}
          className="h-8 w-full rounded-md border px-2 text-sm focus:outline-none focus:ring focus:border-vdcRed"
        />
      </div>

      {/* Results */}
      <div className="space-y-2">
        {searchResults.length === 0 ? (
          <p className="text-center text-gray-500">No players found.</p>
        ) : (
          searchResults.map((player) => {
            console.log(player);

            return (
              <div
                key={player.id}
                className="flex items-center space-x-4 p-3 text-xs text-vdcWhite border rounded-md hover:bg-gray-50 "
              >
                {player.image ? (
                  <Image
                    src={player.image}
                    alt={`${player.discordName} avatar`}
                    width={25}
                    height={25}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-gray-200" />
                )}

                <div className="flex-1">
                  <h1 className="font-medium text-gray-800">
                    {player.discordName}
                  </h1>

                  {player.teamName && (
                    <div className="flex flex-col">
                      <h1 className="text-sm text-gray-600">
                        {player.franchiseSlug} | {player.teamName}
                      </h1>
                      <h1>({player.tier})</h1>
                    </div>
                  )}

                  {player.franchiseLogo && (
                    <Image
                      src={`${TEAM_LOGOS_URL}/${player.franchiseLogo}`}
                      alt={`${player.teamName} logo`}
                      width={25}
                      height={25}
                      className="size-6 mt-1 object-contain"
                    />
                  )}
                </div>

                {/* Riot MMR + IGN */}
                {player.riotIGN && (
                  <div className="text-right text-sm text-gray-600">
                    <p>IGN: {player.riotIGN}</p>
                    {player.mmrEffective && <p>MMR: {player.mmrEffective}</p>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
