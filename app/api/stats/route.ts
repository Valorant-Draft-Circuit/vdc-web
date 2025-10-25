import { getStatsBy } from "@/lib/queries/stats/stats";
import { Tier, GameType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const season = Number(searchParams.get("season"));
  const tier = searchParams.get("tier")?.toUpperCase() as Tier;
  const gameType = searchParams.get("type")?.toUpperCase() as GameType;

  if (!season || !tier || !gameType) {
    return NextResponse.json(
      {
        error: `Missing params. You must provide season, tier, and type`,
      },
      { status: 422 }
    );
  }

  const playerStats = await getStatsBy({
    season: season,
    tier: tier,
    gameType: gameType,
  });

  return NextResponse.json(playerStats);
}
