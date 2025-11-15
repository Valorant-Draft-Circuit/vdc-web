import { prisma } from "@/lib/prisma";
import { Tier, GameType } from "@prisma/client";

export const HEADERS = [
  "AGENT",
  "DISCORD",
  "NAME",
  "FRANCHISE",
  "TEAM",
  "MMR",
  "TIER",
  "LEAGUE_STATUS",
  "CONTRACT_STATUS",
  "CONTRACT_REMAINING",
  "MP",
  "ATK_RATING",
  "DEF_RATING",
  "ACS",
  "K",
  "D",
  "A",
  "KD",
  "KPR",
  "APR",
  "ADR",
  "PLANTS",
  "DEFUSES",
  "ECO_KILLS",
  "ANTIECO_KILLS",
  "TRADE_KILLS",
  "TRADE_DEATHS",
  "CLUTCHES",
  "FK",
  "FKPR",
  "FD",
  "FDPR",
  "HS",
  "KAST",
];

export const FIELDS = [
  { key: "discord", label: "DISCORD" },
  { key: "name", label: "NAME" },
  { key: "agents", label: "AGENT" },
  { key: "franchise", label: "FRANCHISE" },
  { key: "team", label: "TEAM" },
  { key: "mmr", label: "MMR" },
  { key: "tier", label: "TIER" },
  { key: "leagueStatus", label: "LEAGUE_STATUS" },
  { key: "contractStatus", label: "CONTRACT_STATUS" },
  { key: "contractRemaining", label: "CONTRACT_REMAINING" },
  { key: "matchesPlayed", label: "MP" },
  { key: "attackRating", label: "ATK_RATING" },
  { key: "defenseRating", label: "DEF_RATING" },
  { key: "acs", label: "ACS" },
  { key: "totalKills", label: "K" },
  { key: "totalDeaths", label: "D" },
  { key: "totalAssists", label: "A" },
  { key: "kdr", label: "KD" },
  { key: "kpr", label: "KPR" },
  { key: "apr", label: "APR" },
  { key: "adr", label: "ADR" },
  { key: "totalPlants", label: "PLANTS" },
  { key: "totalDefuses", label: "DEFUSES" },
  //{ key: 'totalExitKills', label: 'EXIT_KILLS' },
  { key: "totalEcoKills", label: "ECO_KILLS" },
  { key: "totalAntiecoKills", label: "ANTIECO_KILLS" },
  { key: "totalTradeKills", label: "TRADE_KILLS" },
  { key: "totalTradeDeaths", label: "TRADE_DEATHS" },
  { key: "totalClutches", label: "CLUTCHES" },
  { key: "firstKills", label: "FK" },
  { key: "fkpr", label: "FKPR" },
  { key: "firstDeaths", label: "FD" },
  { key: "fdpr", label: "FDPR" },
  { key: "hs", label: "HS" },
  { key: "kast", label: "KAST" },
];

export type GroupedPlayerStats = {
  userID: string;
  _sum: {
    kills: number | null;
    deaths: number | null;
    assists: number | null;
    plants: number | null;
    defuses: number | null;
    firstKills: number | null;
    firstDeaths: number | null;
    tradeKills: number | null;
    tradeDeaths: number | null;
    ecoKills: number | null;
    antiEcoKills: number | null;
    ecoDeaths: number | null;
    exitKills: number | null;
    clutches: number | null;
  };
  _avg: {
    acs: number | null;
    ratingAttack: number | null;
    ratingDefense: number | null;
    kast: number | null;
    kills: number | null;
    assists: number | null;
    firstKills: number | null;
    firstDeaths: number | null;
    hsPercent: number | null;
  };
  _count: {
    userID: number;
  };
};

export type GroupedGamePlayerStats = {
  userID: string;
  agents: string[];
  team: string | null;
  _sum: {
    kills: number | null;
    deaths: number | null;
    assists: number | null;
    plants: number | null;
    defuses: number | null;
    firstKills: number | null;
    firstDeaths: number | null;
    tradeKills: number | null;
    tradeDeaths: number | null;
    ecoKills: number | null;
    antiEcoKills: number | null;
    ecoDeaths: number | null;
    exitKills: number | null;
  };
  _avg: {
    acs: number | null;
    ratingAttack: number | null;
    ratingDefense: number | null;
    kast: number | null;
    kills: number | null;
    assists: number | null;
    firstKills: number | null;
    firstDeaths: number | null;
    hsPercent: number | null;
  };
  _count: {
    userID: number;
  };
};

export type PlayerNameTeam = {
  id: string;
  PrimaryRiotAccount: {
    riotIGN: string | null;
  } | null;
  Team: {
    name: string;
  } | null;
};

export type FormattedStat = {
  name: string | null;
  team: string;
  matchesPlayed: number;
  acs: number | null;
  attackRating: number | null;
  defenseRating: number | null;
  totalKills: number | null;
  totalDeaths: number | null;
  totalAssists: number | null;
  totalPlants: number | null;
  totalDefuses: number | null;
  totalEcoKills: number | null;
  totalAntiecoKills: number | null;
  totalTradeKills: number | null;
  totalTradeDeaths: number | null;
  totalClutches: number | null;
  kdr: number | null;
  kast: number | null;
  firstKills: number | null;
  firstDeaths: number | null;
  hs: number | null;
};

export type FormattedGameStat = {
  name: string | null;
  team: string | null;
  agents: string[] | null;
  acs: number | null;
  attackRating: number | null;
  defenseRating: number | null;
  totalKills: number | null;
  totalDeaths: number | null;
  totalAssists: number | null;

  kdr: number | null;
  kast: number | null;
  firstKills: number | null;
  firstDeaths: number | null;
  hs: number | null;
};

export type FormattedTeamStat = {
  name: string | null;
  acs: number | null;
  totalKills: number | null;
  totalDeaths: number | null;
  totalAssists: number | null;
  kdr: number | null;
};

type TStatsQuery = {
  tier?: Tier;
  season?: number;
  gameType?: GameType;
  gameId?: string;
  matchId?: string;
};

export async function getStatsBy(statsQuery: TStatsQuery) {
  let playerStats;
  if (statsQuery.gameId) {
    playerStats = await getPlayerStatsByGame(statsQuery.gameId);
    return await formatStats(playerStats, "gameStats");
  } else if (statsQuery.matchId) {
    playerStats = await getAggregatedPlayerStatsByMatch(statsQuery.matchId);
    return await formatStats(playerStats, "gameStats");
  } else {
    playerStats = await getOverallPlayerStats(statsQuery);
    return await formatStats(playerStats);
  }
}

async function getAggregatedPlayerStatsByMatch(
  matchId: string
): Promise<(GroupedPlayerStats & { agents: string[] })[]> {
  const match = await prisma.matches.findFirst({
    where: { matchID: Number(matchId) },
    select: {
      Games: {
        select: {
          PlayerStats: {
            select: {
              Team: { select: { name: true } },
              userID: true,
              agent: true,
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
              acs: true,
              ratingAttack: true,
              ratingDefense: true,
              kast: true,
              hsPercent: true,
            },
          },
        },
      },
    },
  });

  if (!match) return [];

  const allStats = match.Games.flatMap((g) => g.PlayerStats);

  const grouped = allStats.reduce((acc, stat) => {
    const u = stat.userID;

    if (!acc[u]) {
      acc[u] = {
        userID: u,
        agents: new Set<string>(),
        _sum: {
          kills: 0,
          deaths: 0,
          assists: 0,
          plants: 0,
          defuses: 0,
          firstKills: 0,
          firstDeaths: 0,
          tradeKills: 0,
          tradeDeaths: 0,
          ecoKills: 0,
          antiEcoKills: 0,
          ecoDeaths: 0,
          exitKills: 0,
          clutches: 0,
        },
        _avg: {
          acs: 0,
          ratingAttack: 0,
          ratingDefense: 0,
          kast: 0,
          kills: 0,
          assists: 0,
          firstKills: 0,
          firstDeaths: 0,
          hsPercent: 0,
        },
        _count: {
          userID: 0,
        },
      };
    }

    if (stat.agent) acc[u].agents.add(stat.agent);

    Object.keys(acc[u]._sum).forEach((key) => {
      acc[u]._sum[key] += stat[key] ?? 0;
    });

    Object.keys(acc[u]._avg).forEach((key) => {
      acc[u]._avg[key] += stat[key] ?? 0;
    });

    acc[u]._count.userID++;
    return acc;
  }, {} as Record<string, GroupedPlayerStats & { agents: Set<string> }>);

  return Object.values(grouped).map((entry) => {
    const n = entry._count.userID;
    Object.keys(entry._avg).forEach((key) => {
      entry._avg[key] = Number(((entry._avg[key] ?? 0) / n).toFixed(2));
    });

    return {
      ...entry,
      agents: Array.from(entry.agents),
    };
  });
}

export async function getPlayerStatsByGame(
  gameID: string
): Promise<GroupedGamePlayerStats[]> {
  const groupedStats = await prisma.playerStats.groupBy({
    where: {
      Game: { gameID },
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

  const playerData = await prisma.playerStats.findMany({
    where: { Game: { gameID } },
    select: {
      userID: true,
      agent: true,
      Team: { select: { name: true } },
    },
  });

  const mergedMap: Record<string, { agents: string[]; team: string | null }> =
    {};

  for (const { userID, agent, Team } of playerData) {
    if (!mergedMap[userID])
      mergedMap[userID] = { agents: [], team: Team?.name ?? null };
    if (agent) mergedMap[userID].agents.push(agent);
  }

  return groupedStats.map((stat) => ({
    ...stat,
    agents: mergedMap[stat.userID]?.agents ?? [],
    team: mergedMap[stat.userID]?.team ?? null,
  }));
}

async function getOverallPlayerStats(query: TStatsQuery) {
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
  playerStats: GroupedPlayerStats[] | GroupedGamePlayerStats[],
  statType?: string
): Promise<FormattedStat[] | FormattedGameStat[]> {
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
  if (statType === "gameStats") {
    return playerStats.map((stats): FormattedGameStat => {
      const user = userMap[stats.userID];
      const kills = stats._sum.kills ?? 0;
      const deaths = stats._sum.deaths ?? 0;

      return {
        name: user?.PrimaryRiotAccount?.riotIGN ?? null,
        agents: stats.agents ?? null,
        team: stats.team,
        acs: stats._avg.acs,
        attackRating: stats._avg.ratingAttack,
        defenseRating: stats._avg.ratingDefense,
        totalKills: kills,
        totalDeaths: deaths,
        totalAssists: stats._sum.assists,
        kdr: deaths === 0 ? null : kills / deaths,
        kast: stats._avg.kast,
        firstKills: stats._sum.firstKills,
        firstDeaths: stats._sum.firstDeaths,
        hs: stats._avg.hsPercent,
      };
    });
  } else {
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
}
