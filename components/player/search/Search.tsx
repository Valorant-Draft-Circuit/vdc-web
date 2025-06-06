"use client";

import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { Input } from "@headlessui/react";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";

type TPlayer = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    Team: {
      select: {
        name: true;
        tier: true;
        Franchise: { select: { Brand: true } };
      };
    };
    Accounts: { where: { provider: `discord` } };
    PrimaryRiotAccount: { select: { MMR: true; riotIGN: true } };
    Status: true;
  };
}>;
function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }

  return text.substr(0, length) + "\u2026";
}
export default function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<TPlayer> | any>();
  const index = meilisearchClient.getIndex("players");
  async function search(query = "") {
    return await index
      .search(truncate(query, 50))
      .then((res) => {
        console.log("res:", res);
        return res.hits;
      })
      .catch((err) => {
        console.error("err:", err);
        return [];
      });
  }

  useEffect(() => {
    (async () => setSearchResults(await search()))();
  }, []);

  const importPlayers = async () => {
    const res = await fetch("/api/meilisearch/documents/players");
    console.log(res);
  };

  return (
    <div>
      <button onClick={importPlayers}>
        <div className="p-3 bg-vdcRed rounded-2xl">
          <h1 className="text-sm">fetch players</h1>
        </div>
      </button>
      <div className="flex items-center justify-between mb-2 py-4">
        <Input
          placeholder="Search players..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            search(event.target.value).then((results) => {
              setSearchResults(results);
            });
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      <div></div>
    </div>
  );
}
