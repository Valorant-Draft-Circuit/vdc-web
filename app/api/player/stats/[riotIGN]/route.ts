import { ControlPanel, Player } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riotIGN: string }> }
) {
  const currentSeason = await ControlPanel.getSeason();
  const { searchParams } = new URL(request.url);
  const seasonParam = searchParams.get("season");
  const season = seasonParam ? parseInt(seasonParam) : currentSeason;

  const riotIGN = (await params).riotIGN;
  const decodedRiotIGN = decodeURIComponent(riotIGN);
  const playerStats = await Player.getStatsBy(
    { riotIGN: decodedRiotIGN },
    season
  );

  if (playerStats) {
    return NextResponse.json(playerStats);
  }
  return NextResponse.json(
    { error: `Stats not found for player: ${riotIGN} for season: ${season}.` },
    { status: 404 }
  );
}
