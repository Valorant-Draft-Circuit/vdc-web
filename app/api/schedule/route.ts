

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initCache, getSeasonCached, getScheduleByTierCached } from "@/lib/common/cache";

initCache();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");
  const seasonParam = searchParams.get("season");

  if (!tier) {
    return NextResponse.json({ error: "Missing tier" }, { status: 400 });
  }

  const season = seasonParam ? parseInt(seasonParam) : await getSeasonCached();
  const schedule = await getScheduleByTierCached(tier as any, season);

  return NextResponse.json({ schedule, season });
}