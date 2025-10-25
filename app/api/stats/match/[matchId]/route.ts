import { getStatsBy } from "@/lib/queries/stats/stats";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const matchId = (await params).matchId;
  const gameData = await getStatsBy({ matchId: matchId });

  if (gameData) {
    return NextResponse.json(gameData);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
