'use client';

import { useEffect, useState } from 'react';

type Player = {
  userID: string;
  name: string;
  tag: string;
  totalPoints: number;
};

type PlayerCost = {
  userID: string;
  averageFantasyPoints: number;
  cost: number;
};

const PLAYERS_PER_PAGE = 35;
const TEAM_COST_CAP = 1_000_000;

export default function TeamBuilder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [totalPointsSelected, setTotalPointsSelected] = useState(0);
  const [totalCostSelected, setTotalCostSelected] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [playerCosts, setPlayerCosts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'costAsc' | 'costDesc'>('costAsc');
  const [searchQuery, setSearchQuery] = useState('');

  function useDebouncedValue(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
  }

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    async function fetchPlayers() {
      const res = await fetch(
        `/api/fantasy/players?page=${page}&search=${encodeURIComponent(debouncedSearch)}&sort=${sortBy}`
      );
      const data = await res.json();
      setPlayers(data.players);
      setTotalPlayers(data.total);
    }
    fetchPlayers();
  }, [page, debouncedSearch, sortBy]);

  useEffect(() => {
    async function fetchPlayerCosts() {
      const res = await fetch('/api/fantasy/player-costs');
      const data: PlayerCost[] = await res.json();
      const costsMap = data.reduce<Record<string, number>>((acc, player) => {
        acc[player.userID] = player.cost;
        return acc;
      }, {});

      setPlayerCosts(costsMap);
    }
    fetchPlayerCosts();
  }, []);

  useEffect(() => {
    const totalPoints = players
      .filter((p) => selected.includes(p.userID))
      .reduce((sum, p) => sum + p.totalPoints, 0);
    setTotalPointsSelected(totalPoints);

    const totalCost = selected.reduce(
      (sum, userID) => sum + (playerCosts[userID] ?? 0),
      0
    );
    setTotalCostSelected(totalCost);
  }, [selected, players, playerCosts]);

  function canAddPlayer(selectedPlayers: string[], newPlayerID: string) {
    const currentCost = selectedPlayers.reduce(
      (sum, id) => sum + (playerCosts[id] ?? 0),
      0
    );
    const newPlayerCost = playerCosts[newPlayerID] ?? 0;
    return currentCost + newPlayerCost <= TEAM_COST_CAP;
  }

  function toggleSelect(id: string) {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((pid) => pid !== id));
    } else {
      if (selected.length >= 5) return;
      if (!canAddPlayer(selected, id)) {
        alert(`Adding this player exceeds the budget cap of ${TEAM_COST_CAP}.`);
        return;
      }
      setSelected((prev) => [...prev, id]);
    }
  }

  async function handleSubmit() {
    const res = await fetch('/api/fantasy/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_ids: selected }),
    });

    if (res.ok) {
      alert('Team submitted!');
    } else {
      alert('Failed to submit team.');
    }
  }

  const totalPages = Math.ceil(totalPlayers / PLAYERS_PER_PAGE);
  const remainingBudget = TEAM_COST_CAP - totalCostSelected;

  // Use the players as received from backend (already sorted)
  const sortedPlayers = players;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-vdcDark rounded-2xl shadow-xl text-vdcWhite font-montserrat">
      <h2 className="text-2xl font-bold italic mb-6 border-b border-vdcGreyLight pb-3 tracking-wide">
        Build Your Team
      </h2>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-6 mb-10 items-center justify-between">
        {/* Budget Info Boxes */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col bg-vdcGreyDark px-4 py-2 rounded-md shadow-inner">
            <span className="text-vdcGreyLight text-sm font-semibold italic">
              Budget
            </span>
            <span className="text-white font-bold text-lg">
              ${totalCostSelected.toLocaleString()} / ${TEAM_COST_CAP.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col bg-vdcGreyDark px-4 py-2 rounded-md shadow-inner">
            <span className="text-vdcGreyLight text-sm font-semibold italic">
              Remaining
            </span>
            <span className="text-white font-bold text-lg">
              ${remainingBudget.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col bg-vdcGreyDark px-4 py-2 rounded-md shadow-inner">
            <span className="text-vdcGreyLight text-sm font-semibold italic">
              Selected
            </span>
            <span className="text-white font-bold text-lg">{selected.length} / 5</span>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mt-4 sm:mt-0 flex-wrap sm:flex-nowrap">
          <div className="border border-vdcRed rounded-md p-[1px]">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => {
                setPage(1);
                setSearchQuery(e.target.value);
              }}
              className="bg-vdcGreyDark text-white px-4 py-2 rounded-md w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-vdcRed placeholder-vdcGreyLight"
            />
          </div>
          <div className="border border-vdcRed rounded-md p-[2px]">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'costAsc' | 'costDesc');
                setPage(1);
              }}
              className="bg-vdcGreyDark text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-vdcRed"
            >
              <option value="costAsc">Cost: Low to High</option>
              <option value="costDesc">Cost: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Player Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {sortedPlayers.map((player) => {
          const isSelected = selected.includes(player.userID);
          const cost = playerCosts[player.userID] ?? 0;
          return (
            <div
              key={player.userID}
              onClick={() => toggleSelect(player.userID)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition min-h-[160px] flex flex-col justify-between
                ${isSelected
                  ? 'border-vdcRed bg-vdcDarkLight text-white shadow-[0_0_10px_2px_rgba(220,38,38,0.7)]'
                  : 'border-vdcRed/30 bg-vdcDarkLight text-vdcWhite hover:border-vdcRed'

                }`}
            >
              <div className="flex flex-col items-start">
                <span className="text-white text-xl font-semibold">{player.name}</span>
                <span className="text-vdcRed text-md font-bold -mt-1">#{player.tag}</span>
              </div>
              <div className="mt-1">
                <p className="text-white font-bold text-base">
                  Cost: ${cost.toLocaleString()}
                </p>
                <p className="text-vdcGreyLight text-sm">Points: {player.totalPoints.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="rounded-md bg-vdcRed px-5 py-2 text-black font-semibold disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="text-vdcGreyLight font-semibold px-4 py-2 select-none italic">
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="rounded-md bg-vdcRed px-5 py-2 text-black font-semibold disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleSubmit}
          disabled={selected.length !== 5}
          className={`rounded-lg px-8 py-3 font-semibold text-black bg-vdcRed transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Submit Team
        </button>
      </div>
    </div>
  );
}
