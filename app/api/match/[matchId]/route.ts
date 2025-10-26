import { getStatsBy } from "@/lib/queries/stats/stats";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const matchId = (await params).matchId;
  const matchData = await getStatsBy({ matchId: matchId });

  if (matchData) {
    return NextResponse.json(matchData);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
