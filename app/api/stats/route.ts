import {
  FormattedStat,
  GroupedPlayerStats,
  PlayerNameTeam,
} from "@/lib/queries/stats/stats";
import { prisma } from "@/lib/prisma";
import { Tier, GameType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type TStatsQuery = {
  tier: Tier;
  season: number;
  gameType: GameType;
};

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

async function getStatsBy(statsQuery: TStatsQuery) {
  const playerStats = await getPlayerStats(statsQuery);
  return await formatStats(playerStats);
}

async function getPlayerStats(query: TStatsQuery) {
  return await prisma.playerStats.groupBy({
    where: {
      Game: {
        gameType: query.gameType,
        tier: query.tier,
        season: query.season,
      },
    },
    by: ["userID"],
    _sum: {
      kills: true,
      deaths: true,
      assists: true,
      plants: true,
      defuses: true,
      firstKills: true,
      firstDeaths: true,
      tradeKills: true,
      tradeDeaths: true,
      ecoKills: true,
      antiEcoKills: true,
      ecoDeaths: true,
      exitKills: true,
      clutches: true,
    },
    _avg: {
      acs: true,
      ratingAttack: true,
      ratingDefense: true,
      kast: true,
      kills: true,
      assists: true,
      firstKills: true,
      firstDeaths: true,
      hsPercent: true,
    },
    _count: {
      userID: true,
    },
  });
}

async function formatStats(
  playerStats: GroupedPlayerStats[]
): Promise<FormattedStat[]> {
  const userIds = playerStats.map((ps) => ps.userID);

  const users: PlayerNameTeam[] = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      PrimaryRiotAccount: {
        select: { riotIGN: true },
      },
      Team: {
        select: { name: true },
      },
    },
  });

  const userMap: Record<string, PlayerNameTeam> = Object.fromEntries(
    users.map((u) => [u.id, u])
  );

  return playerStats.map((stats): FormattedStat => {
    const user = userMap[stats.userID];
    const teamName = user?.Team?.name ?? "FA/RFA";
    const kills = stats._sum.kills ?? 0;
    const deaths = stats._sum.deaths ?? 0;

    return {
      name: user?.PrimaryRiotAccount?.riotIGN ?? null,
      team: teamName,
      matchesPlayed: stats._count.userID,
      acs: stats._avg.acs,
      attackRating: stats._avg.ratingAttack,
      defenseRating: stats._avg.ratingDefense,
      totalKills: kills,
      totalDeaths: deaths,
      totalAssists: stats._sum.assists,
      totalPlants: stats._sum.plants,
      totalDefuses: stats._sum.defuses,
      totalEcoKills: stats._sum.ecoKills,
      totalAntiecoKills: stats._sum.antiEcoKills,
      totalTradeKills: stats._sum.tradeKills,
      totalTradeDeaths: stats._sum.tradeDeaths,
      totalClutches: stats._sum.clutches,
      kdr: deaths === 0 ? null : kills / deaths,
      kast: stats._avg.kast,
      firstKills: stats._sum.firstKills,
      firstDeaths: stats._sum.firstDeaths,
      hs: stats._avg.hsPercent,
    };
  });
}
