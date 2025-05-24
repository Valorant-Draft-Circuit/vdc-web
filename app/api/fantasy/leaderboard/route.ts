import { NextResponse } from 'next/server';
import { getFantasyLeaderboard } from '@/prisma/_Fantasy';
import { ControlPanel } from "@/prisma";

export async function GET(req: Request) {
    try {
        const currentSeason = await ControlPanel.getSeason();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "0", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search")?.toLowerCase() ?? "";

        const fullResult = await getFantasyLeaderboard(currentSeason);
        const fullData = fullResult.data; // <== FIX

        // Rank all players globally
        const ranked = fullData
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((entry, i) => ({ ...entry, rank: i + 1 }));

        // If search is active, filter results
        const filtered = search
            ? ranked.filter(
                  (p) =>
                      p.name.toLowerCase().includes(search) ||
                      p.tag.toLowerCase().includes(search)
              )
            : ranked;

        const start = page * limit;
        const end = start + limit;

        const paginated = filtered.slice(start, end);

        return NextResponse.json({ data: paginated, total: filtered.length });
    } catch (err) {
        console.error("API error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


