import { getSeasonCached } from "@/lib/common/cache";
import { getStatsBy } from "@/lib/queries/stats/stats";
import { prisma } from "@/prisma/prismadb";
import { Tier } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  slug: string;
  tier: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { slug, tier } = await params;
  const tierEnum = tier.toUpperCase() as Tier;
  const currentSeason = await getSeasonCached();

  const franchise = await prisma.franchise.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (!franchise) {
    const error = `Franchise ID of slug ${slug} not found.`;
    return NextResponse.json({ message: error }, { status: 404 });
  }

  const team = await prisma.teams.findFirst({
    where: {
      tier: tierEnum,
      franchise: franchise.id,
    },
    select: { id: true },
  });

  if (!team) {
    const error = `Team of slug ${slug} and tier ${tier} not found.`;
    return NextResponse.json({ message: error }, { status: 404 });
  }

  const playerStats = await getStatsBy({
    teamId: team.id,
    season: currentSeason,
  });
  return NextResponse.json(playerStats);
}
