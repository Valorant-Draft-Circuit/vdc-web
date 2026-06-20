"use client";

import { MeiliPlayer } from "@/lib/types/meilisearch";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import {
  Checkbox,
  Field,
  Input,
  Label,
  Menu,
  MenuButton,
  MenuItems,
  Select,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import PlayerCard from "./PlayerCard";
import { STATUS_LABELS, TIERS_LIST } from "@/lib/common/constants";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
// import { LeagueStatus } from "@prisma/client";

export default function PlayerSearch({ mmrShow }: { mmrShow: boolean }) {
  const defaultStatus = [
    // LeagueStatus.GENERAL_MANAGER,
    // LeagueStatus.SIGNED,
    // LeagueStatus.FREE_AGENT,
    // LeagueStatus.RESTRICTED_FREE_AGENT,
  ];

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MeiliPlayer[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(defaultStatus);

  const index = meilisearchClient.getIndex("players");
  const LIMIT = 30;

  function buildFilter(): string[] {
    const filters: string[] = [];
    if (tierFilter) filters.push(`tier = "${tierFilter}"`);
    if (statusFilter.length > 0) {
      filters.push(
        statusFilter.map((s) => `leagueStatus = "${s}"`).join(" OR ")
      );
    }
    return filters;
  }

  async function fetchPage(q: string, pageNumber: number) {
    setLoading(true);
    const offset = pageNumber * LIMIT;

    try {
      const res = await index.search(truncate(q, 50), {
        limit: LIMIT,
        offset,
        filter: buildFilter(),
      });

      const hits = res.hits as MeiliPlayer[];
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
    setPage(0);
    setHasMore(true);
    void fetchPage(query, 0);
  }, [query, tierFilter, statusFilter]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchPage(query, nextPage);
  };

  return (
    <div className="flex flex-col m-auto pt-1">
      <div className="flex flex-col xl:flex-col items-center justify-between bg-vdcWhite dark:bg-vdcBlack mb-4 pt-8 pb-2 px-10 xl:px-0 sticky top-0 z-10 gap-2">
        <div className="flex flex-row pb-5 w-full">
          <Filters
            tierFilter={tierFilter}
            setTierFilter={setTierFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>
        <Input
          placeholder="Search players..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          className="h-8 w-full rounded-md border px-2 text-sm focus:outline-none focus:ring focus:border-vdcRed bg-vdcWhite dark:bg-vdcBlack"
        />
      </div>

      <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 m-auto">
        {searchResults.length === 0 ? (
          <h1 className="text-center text-gray-500">No players found.</h1>
        ) : (
          searchResults.map((player) => (
            <PlayerCard key={player.id} player={player} mmrShow={mmrShow} />
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

type FilterProps = {
  tierFilter: string;
  setTierFilter: (v: string) => void;
  statusFilter: string[];
  setStatusFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

function Filters({
  tierFilter,
  setTierFilter,
  statusFilter,
  setStatusFilter,
}: FilterProps) {
  return (
    <div className="flex flex-wrap gap-2 text-sm xl:mt-0">
      <Select
        onChange={(e) => setTierFilter(e.target.value)}
        value={tierFilter}
        className="w-fit rounded-lg border-none bg-gray-100 dark:bg-vdcGrey font-semibold px-3 py-1.5 text-vdcGrey dark:text-vdcWhite focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white"
      >
        <option value="">ALL TIERS</option>
        {TIERS_LIST.map((tier) => (
          <option key={tier} value={tier}>
            {tier}
          </option>
        ))}
      </Select>
      <div>
        <StatusFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
    </div>
  );
}

function StatusFilter({
  statusFilter,
  setStatusFilter,
}: Pick<FilterProps, "statusFilter" | "setStatusFilter">) {
  return (
    <Menu>
      <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-100 dark:bg-vdcGrey px-3 py-1.5 text-vdcGrey dark:text-vdcWhite shadow-inner focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:opacity-90 data-open:brightness-80 transition-all ease-in duration-75">
        <h2>League Status</h2> <ChevronDownIcon className="size-4" />
      </MenuButton>
      <MenuItems
        anchor="bottom"
        className="drop-shadow-2xl w-48 z-20 origin-top-right rounded-xl bg-gray-300 dark:bg-vdcGrey p-4 text-sm transition-opacity duration-100 ease-out [--anchor-gap:--spacing(1)] shadow-inner focus:outline-none data-closed:scale-95 data-closed:opacity-0 "
      >
        {Object.entries(STATUS_LABELS)
          .filter(([, label]) => label !== "")
          .map(([status, label]) => {
            const isChecked = statusFilter.includes(status);
            const toggle = () => {
              setStatusFilter((prev) =>
                isChecked ? prev.filter((s) => s !== status) : [...prev, status]
              );
            };

            return (
              <Field key={status} className="flex items-center gap-2">
                <Checkbox
                  checked={isChecked}
                  onChange={toggle}
                  className="group block size-4 rounded border bg-vdcWhite data-checked:bg-vdcRed"
                >
                  <svg
                    className="stroke-white opacity-0 group-data-checked:opacity-100"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3 8L6 11L11 3.5"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Checkbox>
                <Label>
                  <h2>{label}</h2>
                </Label>
              </Field>
            );
          })}
      </MenuItems>
    </Menu>
  );
}

function truncate(text: string, length: number) {
  return text.length <= length ? text : text.substr(0, length) + "\u2026";
}
