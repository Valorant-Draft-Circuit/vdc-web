import { NextResponse } from 'next/server';
import { getFantasyLeaderboard } from '@/prisma/_Fantasy';
import { ControlPanel } from "@/prisma";

export async function GET(req: Request) {
    const currentSeason = await ControlPanel.getSeason();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const fullData = await getFantasyLeaderboard(currentSeason);

    const start = page * limit;
    const end = start + limit;

    const paginatedData = fullData.slice(start, end);

    return NextResponse.json(paginatedData);
}
