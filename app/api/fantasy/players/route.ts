import { NextResponse } from 'next/server';
import { getFantasyLeaderboard } from '@/prisma/_Fantasy';
import { ControlPanel } from "@/prisma";

export async function GET(request: Request) {
    const currentSeason = await ControlPanel.getSeason();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const limit = 35;
    const offset = (page - 1) * limit;

    const fullLeaderboard = await getFantasyLeaderboard(currentSeason);

    const filtered = search
        ? fullLeaderboard.filter((player) =>
            player.name.toLowerCase().includes(search)
        )
        : fullLeaderboard;

    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
        total: filtered.length,
        players: paginated,
    });
}

