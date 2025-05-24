import { NextResponse } from 'next/server';
import { getFantasyLeaderboard } from '@/prisma/_Fantasy';
import { ControlPanel } from '@/prisma';
import { calculatePlayerCosts } from '@/prisma/_Cost'; // <-- you need this function

export async function GET(request: Request) {
  const currentSeason = await ControlPanel.getSeason();

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const search = url.searchParams.get('search')?.toLowerCase() || '';
  const sort = url.searchParams.get('sort') || 'costAsc';

  const limit = 35;
  const offset = (page - 1) * limit;

  // Get leaderboard players for current season
  const fullLeaderboard = await getFantasyLeaderboard(currentSeason);

  // Get all player costs
  const costsArray = await calculatePlayerCosts(currentSeason); // returns [{ userID, cost }, ...]
  const costsMap = costsArray.reduce<Record<string, number>>((acc, c) => {
    acc[c.userID] = c.cost;
    return acc;
  }, {});

  // Filter players by search
  const filtered = search
    ? fullLeaderboard.filter((player) =>
        player.name.toLowerCase().includes(search)
      )
    : fullLeaderboard;

  // Add cost to each player object for sorting
  const withCost = filtered.map((player) => ({
    ...player,
    cost: costsMap[player.userID] ?? 0,
  }));

  // Sort players by cost or name
  const sorted = withCost.sort((a, b) => {
    if (sort === 'costAsc') return a.cost - b.cost;
    if (sort === 'costDesc') return b.cost - a.cost;
    if (sort === 'nameAsc') return a.name.localeCompare(b.name);
    if (sort === 'nameDesc') return b.name.localeCompare(a.name);
    return 0;
  });

  // Paginate after sorting
  const paginated = sorted.slice(offset, offset + limit);

  // Return paginated players (with cost)
  return NextResponse.json({
    total: filtered.length,
    players: paginated,
  });
}
