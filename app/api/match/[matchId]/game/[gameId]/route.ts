import { getStatsBy } from "@/lib/queries/stats/stats";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const gameId = (await params).gameId;
  const gameData = await getStatsBy({ gameId: gameId });

  if (gameData) {
    return NextResponse.json(gameData);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
