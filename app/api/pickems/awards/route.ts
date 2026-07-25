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
