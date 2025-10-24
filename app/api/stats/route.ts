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

  
  if (statsQuery.gameType === GameType.COMBINE) {
    const roundsRows = await prisma.playerStats.findMany({
      where: {
        Game: {
          gameType: statsQuery.gameType,
          tier: statsQuery.tier,
          season: statsQuery.season,
        },
      },
      select: {
        userID: true,
        Game: {
          select: { rounds: true },
        },
      },
    });

    const roundsMap: Record<string, number> = {};
    for (const row of roundsRows) {
      const r = row.Game?.rounds ?? 0;
      roundsMap[row.userID] = (roundsMap[row.userID] || 0) + r;
    }

  return await formatStats(playerStats, roundsMap, undefined, undefined, false, false);
  }

  
  const statRows = await prisma.playerStats.findMany({
    where: {
      Game: {
        gameType: statsQuery.gameType,
        tier: statsQuery.tier,
        season: statsQuery.season,
      },
    },
    select: {
      userID: true,
      team: true,
      Game: {
        select: {
          rounds: true,
          roundsWonHome: true,
          roundsWonAway: true,
          winner: true,
          Match: {
            select: { home: true, away: true },
          },
        },
      },
    },
  });

  const roundsMap: Record<string, number> = {};
  const winsMap: Record<string, number> = {};
  const winnerRoundsMap: Record<string, number> = {};

  for (const row of statRows) {
    const uid = row.userID;
    const g = row.Game;
    const teamId = row.team;
    const rounds = g?.rounds ?? 0;
    roundsMap[uid] = (roundsMap[uid] || 0) + rounds;

   
    if (g?.winner && teamId && g.winner === teamId) {
      winsMap[uid] = (winsMap[uid] || 0) + 1;
    }

    
    let sideRounds = 0;
    if (g?.Match) {
      const homeId = g.Match.home;
      const awayId = g.Match.away;
      if (teamId && homeId && teamId === homeId) {
        sideRounds = g.roundsWonHome ?? 0;
      } else if (teamId && awayId && teamId === awayId) {
        sideRounds = g.roundsWonAway ?? 0;
      }
    }
    winnerRoundsMap[uid] = (winnerRoundsMap[uid] || 0) + sideRounds;
  }

  return await formatStats(playerStats, roundsMap, winsMap, winnerRoundsMap, true);
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
  playerStats: GroupedPlayerStats[],
  roundsMap?: Record<string, number>,
  winsMap?: Record<string, number>,
  winnerRoundsMap?: Record<string, number>,
  includeWinPercent = true,
  includeRounds = true
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

  const totalRounds = includeRounds && roundsMap ? (roundsMap[stats.userID] ?? 0) : undefined;
    const wins = winsMap?.[stats.userID] ?? 0;
    const winnerRounds = winnerRoundsMap?.[stats.userID] ?? 0;
    const mapWinPercent = stats._count.userID > 0 ? wins / stats._count.userID : null;
  const roundWinPercent = typeof totalRounds === "number" && totalRounds > 0 ? winnerRounds / totalRounds : null;

    const base: any = {
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

    if (includeRounds && totalRounds !== undefined) {
      base.totalRounds = totalRounds;
    }

    if (includeWinPercent) {
      base.mapWinPercent = mapWinPercent;
      base.roundWinPercent = roundWinPercent;
    }

    return base as FormattedStat;
  });
}
