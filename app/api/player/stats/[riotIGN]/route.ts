import { getPlayerStatsBy } from "@/lib/queries/stats/stats";
import { ControlPanel } from "@/prisma";
import { GameType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riotIGN: string }> },
) {
  const currentSeason = await ControlPanel.getSeason();
  const { searchParams } = new URL(request.url);
  const seasonParam = searchParams.get("season");
  const season = seasonParam ? parseInt(seasonParam) : currentSeason;
  const gameType = searchParams.get("type")?.toUpperCase() as GameType;

  const riotIGN = (await params).riotIGN;
  const decodedRiotIGN = decodeURIComponent(riotIGN);
  const playerStats = await getPlayerStatsBy({
    season: season,
    riotIgn: decodedRiotIGN,
    gameType: gameType,
  });

  if (playerStats) {
    return NextResponse.json(playerStats);
  }
  return NextResponse.json(
    {
      error: `Stats not found for player: ${riotIGN} for gameType :${gameType} for season: ${season}.`,
    },
    { status: 404 },
  );
}
