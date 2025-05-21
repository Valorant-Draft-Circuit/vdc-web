import { NextResponse } from "next/server";
import { calculatePlayerCosts } from '@/prisma/_Cost';
import { ControlPanel } from "@/prisma";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const currentSeason = await ControlPanel.getSeason();

        const playerCosts = await calculatePlayerCosts(currentSeason);

        return NextResponse.json(playerCosts);
    } catch (error) {
        console.error("Error fetching player costs:", error);
        return NextResponse.json({ error: "Failed to fetch player costs" }, { status: 500 });
    }
}
