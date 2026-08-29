import { determineTierWithTierLines, getMMRTierLines } from "@/lib/common/tier";
import { hasFlags } from "@/lib/common/flags";
import { normalizeAgentName } from "@/lib/common/agents";
import { getAgentCatalog } from "@/lib/queries/agents/getAgentCatalog";
import { prisma } from "@/lib/prisma";
import { ControlPanel, Flags } from "@/prisma";
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
  "RATING",
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
  { key: "roles", label: "ROLES" },
  { key: "agents", label: "AGENT" },
  { key: "franchise", label: "FRANCHISE" },
  { key: "team", label: "TEAM" },
  { key: "mmr", label: "MMR" },
  { key: "tier", label: "TIER" },
  { key: "leagueStatus", label: "STATUS", title: "League Status" },
  { key: "contractStatus", label: "CONTRACT", title: "Contract Status" },
  { key: "contractRemaining", label: "SZNs", title: "Contract Remaining" },
  { key: "matchesPlayed", label: "MP", title: "Matches Played" },
  { key: "rating", label: "RTG", title: "Overall Rating" },
  { key: "attackRating", label: "ATK", title: "Attack Rating" },
  { key: "defenseRating", label: "DEF", title: "Defense Rating" },
  { key: "acs", label: "ACS", title: "Average Combat Score" },
  { key: "totalKills", label: "K", title: "Kills" },
  { key: "totalDeaths", label: "D", title: "Deaths" },
  { key: "totalAssists", label: "A", title: "Assists" },
  { key: "kdr", label: "KD", title: "Kill/Death Ratio" },
  { key: "kpr", label: "KPR", title: "Kills Per Round" },
  { key: "apr", label: "APR", title: "Assists Per Round" },
  { key: "adr", label: "ADR", title: "Average Damage Per Round" },
  { key: "totalPlants", label: "PLA", title: "Plants" },
  { key: "totalDefuses", label: "DEF", title: "Defuses" },
  //{ key: 'totalExitKills', label: 'EXIT_KILLS' },
  { key: "totalEcoKills", label: "EK", title: "Eco Kills" },
  { key: "totalAntiecoKills", label: "AEK", title: "Anti-Eco Kills" },
  { key: "totalTradeKills", label: "TK", title: "Trade Kills" },
  { key: "totalTradeDeaths", label: "TD", title: "Trade Deaths" },
  { key: "totalClutches", label: "CL", title: "Clutches" },
  { key: "firstKills", label: "FK", title: "First Kills" },
  { key: "fkpr", label: "FKPR", title: "First Kills Per Round" },
  { key: "firstDeaths", label: "FD", title: "First Deaths" },
  { key: "fdpr", label: "FDPR", title: "First Deaths Per Round" },
  { key: "hs", label: "HS", title: "Headshot Percentage" },
  { key: "kast", label: "KAST", title: "Kill/Assist/Survive/Trade Percentage" },
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
    MMR: {
      mmrEffective: number | null;
    } | null;
  } | null;
  Team: {
    name: string;
    tier: Tier;
    Franchise: { slug: string };
  } | null;
  flags: string;
  tier: Tier;
};

export type FormattedStat = {
  name: string | null;
  team: string;
  currentTier: Tier;
  matchesPlayed: number;
  acs: number | null;
  rating: number | null;
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
  roles?: string[];
  teamSlug?: string | null;
  teamTier?: Tier | null;
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

type StatsQuery = {
  tier?: Tier;
  season?: number;
  gameType?: GameType;
  gameId?: string;
  matchId?: string;
  teamId?: number;
};

type PlayerStatsQuery = {
  season: number;
  riotIgn: string;
  gameType: GameType;
};

export async function getPlayerStatsBy(playerStatsQuery: PlayerStatsQuery) {
  const playerStats = await getPlayerStats(playerStatsQuery);
  return playerStats;
}

export async function getStatsBy(statsQuery: StatsQuery) {
  let playerStats;
  if (statsQuery.gameId) {
    playerStats = await getPlayerStatsByGame(statsQuery.gameId);
    return await formatStats({ playerStats, statType: "gameStats" });
  } else if (statsQuery.matchId) {
    playerStats = await getAggregatedPlayerStatsByMatch(statsQuery.matchId);
    return await formatStats({ playerStats, statType: "gameStats" });
  } else if (statsQuery.teamId && statsQuery.season) {
    playerStats = await getStatsByTeam(statsQuery.teamId, statsQuery.season);
    const [formatted, roleIconsByIgn] = await Promise.all([
      formatStats({ playerStats }),
      getTeamRoleIcons(statsQuery.teamId, statsQuery.season),
    ]);
    return (formatted as FormattedStat[]).map((row) => ({
      ...row,
      roles: row.name ? (roleIconsByIgn.get(row.name) ?? []) : [],
    }));
  } else {
    playerStats = await getOverallPlayerStats(statsQuery);
    return await formatStats({ playerStats, gameType: statsQuery.gameType });
  }
}

async function getPlayerStats(playerStatsQuery: PlayerStatsQuery) {
  const userId = await prisma.account.findFirst({
    where: { riotIGN: playerStatsQuery.riotIgn },
    select: { userId: true },
  });
  if (!userId) {
    throw new Error(`No user found with riotIGN: ${playerStatsQuery.riotIgn}`);
  }

  const includedGameTypes =
    playerStatsQuery.gameType === GameType.SEASON
      ? [GameType.SEASON, GameType.PLAYOFF]
      : [playerStatsQuery.gameType];

  return prisma.playerStats.findMany({
    where: {
      AND: [
        { userID: userId.userId },
        { Game: { gameType: { in: includedGameTypes } } },
        { Game: { season: playerStatsQuery.season } },
      ],
    },
    orderBy: { Game: { datePlayed: "asc" } },
    include: { Game: { include: { Match: true } } },
  });
}

async function getStatsByTeam(teamId: number, season: number) {
  const leagueState = await ControlPanel.getLeagueState();
  const gameType =
    leagueState === "COMBINES" ? GameType.COMBINE : GameType.SEASON;

  return prisma.playerStats.groupBy({
    where: {
      Game: { season: season, gameType: gameType },
      team: teamId,
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

async function getTeamRoleIcons(
  teamId: number,
  season: number,
): Promise<Map<string, string[]>> {
  const leagueState = await ControlPanel.getLeagueState();
  const gameType =
    leagueState === "COMBINES" ? GameType.COMBINE : GameType.SEASON;

  const [agentRows, catalog] = await Promise.all([
    prisma.playerStats.findMany({
      where: {
        Game: { season: season, gameType: gameType },
        team: teamId,
      },
      select: {
        agent: true,
        Player: {
          select: { PrimaryRiotAccount: { select: { riotIGN: true } } },
        },
      },
    }),
    getAgentCatalog(),
  ]);

  const roleGameCountsByIgn = new Map<string, Map<string, number>>();
  for (const row of agentRows) {
    const riotIgn = row.Player.PrimaryRiotAccount?.riotIGN;
    const role = catalog[normalizeAgentName(row.agent)]?.role;
    if (!riotIgn || !role?.iconUrl) continue;
    const roleCounts =
      roleGameCountsByIgn.get(riotIgn) ?? new Map<string, number>();
    roleGameCountsByIgn.set(riotIgn, roleCounts);
    roleCounts.set(role.iconUrl, (roleCounts.get(role.iconUrl) ?? 0) + 1);
  }

  const roleIconsByIgn = new Map<string, string[]>();
  for (const [riotIgn, roleCounts] of roleGameCountsByIgn) {
    const iconsByUsage = [...roleCounts.entries()]
      .sort((first, second) => second[1] - first[1])
      .map(([iconUrl]) => iconUrl);
    roleIconsByIgn.set(riotIgn, iconsByUsage);
  }
  return roleIconsByIgn;
}

async function getAggregatedPlayerStatsByMatch(
  matchId: string,
): Promise<(GroupedPlayerStats & { agents: string[] })[]> {
  const numericMatchId = Number(matchId);
  if (!Number.isInteger(numericMatchId)) return [];
  const match = await prisma.matches.findFirst({
    where: { matchID: numericMatchId },
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

  const grouped = allStats.reduce(
    (acc, stat) => {
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
      if (stat.agent) {
        acc[u].agents.add(normalizeAgentName(stat.agent));
      }

      Object.keys(acc[u]._sum).forEach((key) => {
        acc[u]._sum[key] += stat[key] ?? 0;
      });

      Object.keys(acc[u]._avg).forEach((key) => {
        acc[u]._avg[key] += stat[key] ?? 0;
      });

      acc[u]._count.userID++;
      return acc;
    },
    {} as Record<string, GroupedPlayerStats & { agents: Set<string> }>,
  );

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
  gameID: string,
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
    if (agent) mergedMap[userID].agents.push(normalizeAgentName(agent));
  }

  return groupedStats.map((stat) => ({
    ...stat,
    agents: mergedMap[stat.userID]?.agents ?? [],
    team: mergedMap[stat.userID]?.team ?? null,
  }));
}

async function getOverallPlayerStats(query: StatsQuery) {
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

async function formatStats(opts: {
  playerStats: GroupedPlayerStats[] | GroupedGamePlayerStats[];
  statType?: string;
  gameType?: GameType;
}): Promise<FormattedStat[] | FormattedGameStat[]> {
  const userIds = opts.playerStats.map((ps) => ps.userID);
  const mmrTierLines = await getMMRTierLines();
  const usersData = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      PrimaryRiotAccount: {
        select: {
          riotIGN: true,
          MMR: {
            select: { mmrEffective: true },
          },
        },
      },
      Team: {
        select: {
          name: true,
          tier: true,
          Franchise: { select: { slug: true } },
        },
      },
      flags: true,
    },
  });

  const users: PlayerNameTeam[] = [];
  usersData.forEach((userData) => {
    const userMmr = userData?.PrimaryRiotAccount?.MMR?.mmrEffective;
    const userTier = determineTierWithTierLines(userMmr!, mmrTierLines) as Tier;
    users.push({ ...userData, tier: userTier });
  });

  const userMap: Record<string, PlayerNameTeam> = Object.fromEntries(
    users.map((u) => [u.id, u]),
  );
  if (opts.statType === "gameStats") {
    return opts.playerStats.map((stats): FormattedGameStat => {
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
    return opts.playerStats.map((stats): FormattedStat => {
      const user = userMap[stats.userID];

      const isNewPlayer = !hasFlags(user.flags, [Flags.ACTIVE_LAST_SEASON]);
      const isRFA = hasFlags(user.flags, [Flags.REGISTERED_AS_RFA]);
      const isFA = hasFlags(user.flags, [Flags.ACTIVE_LAST_SEASON]);

      let teamName;
      if (opts.gameType === GameType.COMBINE) {
        if (!user?.Team?.name && isRFA) {
          teamName = "RFA";
        } else if (!user?.Team?.name && isNewPlayer) {
          teamName = "DE";
        } else if (!user?.Team?.name && isFA) {
          teamName = "FA";
        } else if (user?.Team?.name) {
          teamName = user?.Team?.name;
        }
      } else {
        if (!user?.Team?.name && isRFA) {
          teamName = "RFA";
        } else if (!user.Team?.name) {
          teamName = "FA";
        } else if (user?.Team?.name) {
          teamName = user?.Team?.name;
        }
      }

      const kills = stats._sum.kills ?? 0;
      const deaths = stats._sum.deaths ?? 0;

      return {
        name: user?.PrimaryRiotAccount?.riotIGN ?? null,
        team: teamName,
        teamSlug: user?.Team?.Franchise.slug ?? null,
        teamTier: user?.Team?.tier ?? null,
        currentTier: user.tier,
        matchesPlayed: stats._count.userID,
        acs: stats._avg.acs,
        rating:
          stats._avg.ratingAttack !== null && stats._avg.ratingDefense !== null
            ? (stats._avg.ratingAttack + stats._avg.ratingDefense) / 2
            : null,
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
