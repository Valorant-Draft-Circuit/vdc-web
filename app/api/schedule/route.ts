import { NextResponse } from "next/server";
import {
  initCache,
  getSeasonCached,
  getScheduleByTierCached,
} from "@/lib/common/cache";
import { Tier } from "@prisma/client";

initCache();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tierParam = searchParams.get("tier");
  const seasonParam = searchParams.get("season");

  if (!tierParam) {
    return NextResponse.json({ error: "Missing tier" }, { status: 400 });
  }
  // normalize user input to uppercase so "expert" → "EXPERT"
  const normalizedTier = tierParam.toUpperCase();
  const tier = Tier[normalizedTier as keyof typeof Tier];

  if (!tier) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const season = seasonParam ? parseInt(seasonParam) : await getSeasonCached();
  const schedule = await getScheduleByTierCached(tier, season);

  return NextResponse.json({ schedule, season });
}
