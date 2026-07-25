import { getSeasonCached } from "@/lib/common/cache";
import { getLeagueState } from "@/lib/queries/control/control";
import { getSeasonPickemAwards } from "@/lib/pickems/getSeasonAwards";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const season = Number(request.nextUrl.searchParams.get("season"));
  if (!Number.isInteger(season)) {
    return NextResponse.json(
      { message: "Invalid or missing season." },
      { status: 400 },
    );
  }

  const [currentSeason, leagueState] = await Promise.all([
    getSeasonCached(),
    getLeagueState(),
  ]);
  const pickemsFinal =
    season < currentSeason ||
    (season === currentSeason && leagueState === "OFFSEASON");
  if (!pickemsFinal) {
    return NextResponse.json(
      {
        message: `Season ${season} pickems are not final yet (league state: ${leagueState ?? "unknown"}). Winners are visible after the season concludes.`,
      },
      { status: 409 },
    );
  }

  try {
    const awards = await getSeasonPickemAwards(season);
    return NextResponse.json(awards);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
