import { LeagueStatus, Tier } from "@prisma/client";
import { TIER_RANK } from "@/lib/common/constants/tiers";

export function isUserPlaying(player) {
  if (
    player.leagueStatus === LeagueStatus.SIGNED ||
    player.leagueStatus === LeagueStatus.FREE_AGENT ||
    player.leagueStatus === LeagueStatus.RESTRICTED_FREE_AGENT
  ) {
    return true;
  } else if (
    player.leagueStatus === LeagueStatus.GENERAL_MANAGER &&
    player.teamName
  ) {
    return true;
  }
  return false;
}

/**
 * Splits riotIGN to [IGN, #Tag]
 * @param riotIGN RiotIGN#Tag
 * @returns [RiotIGN, #Tag]
 */
export function parseRiotIGN(riotIGN: string) {
  const riotSplit = riotIGN.split("#");
  return [riotSplit[0], `#${riotSplit[1]}`];
}

export function deriveTeamIdFromStats(
  stats: ReadonlyArray<{ team: number | null }>,
): number | null {
  const counts = new Map<number, number>();
  for (const stat of stats) {
    if (typeof stat.team !== "number") continue;
    counts.set(stat.team, (counts.get(stat.team) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  let topTeamId: number | null = null;
  let topCount = -1;
  for (const [teamId, count] of counts) {
    if (count > topCount) {
      topCount = count;
      topTeamId = teamId;
    }
  }
  return topTeamId;
}

type TeamGameStat = {
  team: number | null;
  Game: { winner: number | null; datePlayed: Date };
};

export type PlayerTeamSeasonSummary = {
  teamId: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  mostRecentDate: Date;
};

/**
 * Groups a player's season stats by team, computing the player's own record on
 * each team. Sorted by the player's most recent game on that team (newest first),
 * which drives the historical team carousel order.
 */
export function summarizePlayerTeamsBySeason(
  stats: ReadonlyArray<TeamGameStat>,
): PlayerTeamSeasonSummary[] {
  const summaryByTeam = new Map<number, PlayerTeamSeasonSummary>();

  for (const stat of stats) {
    if (typeof stat.team !== "number") continue;

    const { winner, datePlayed } = stat.Game;
    const isWin = winner === stat.team;
    const isLoss = winner !== null && winner !== stat.team;

    const existing = summaryByTeam.get(stat.team);
    if (!existing) {
      summaryByTeam.set(stat.team, {
        teamId: stat.team,
        gamesPlayed: 1,
        wins: isWin ? 1 : 0,
        losses: isLoss ? 1 : 0,
        mostRecentDate: datePlayed,
      });
      continue;
    }

    existing.gamesPlayed += 1;
    if (isWin) existing.wins += 1;
    if (isLoss) existing.losses += 1;
    if (datePlayed > existing.mostRecentDate) {
      existing.mostRecentDate = datePlayed;
    }
  }

  const summaries = Array.from(summaryByTeam.values());
  summaries.sort(
    (a, b) => b.mostRecentDate.getTime() - a.mostRecentDate.getTime(),
  );
  return summaries;
}

type FreeAgentGameStat = {
  team: number | null;
  ratingAttack: number | null;
  ratingDefense: number | null;
  acs: number | null;
  kast: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  damage: number | null;
  Game: {
    tier: Tier;
    datePlayed: Date;
    winner: number | null;
    rounds: number;
  };
};

export type FreeAgentSeasonSummary = {
  gamesPlayed: number;
  teamIds: number[];
  tiers: Tier[];
  lastPlayed: Date | null;
  wins: number;
  losses: number;
  avgRating: number;
  avgAcs: number;
  avgKast: number;
  kda: number;
  adr: number;
};

/**
 * Aggregates a player's current-season games into the scouting summary shown on
 * the Free Agent card: how much/where they have played and how they performed,
 * drawn from every game in the season sample (sub appearances, combines, etc.).
 */
export function summarizeFreeAgentSeason(
  stats: ReadonlyArray<FreeAgentGameStat>,
): FreeAgentSeasonSummary {
  const teamIds = new Set<number>();
  const tiers = new Set<Tier>();
  let lastPlayed: Date | null = null;
  let wins = 0;
  let losses = 0;

  let ratingSum = 0;
  let ratingCount = 0;
  let acsSum = 0;
  let acsCount = 0;
  let kastSum = 0;
  let kastCount = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalDamage = 0;
  let totalRounds = 0;

  for (const stat of stats) {
    if (typeof stat.team === "number") teamIds.add(stat.team);
    tiers.add(stat.Game.tier);

    if (lastPlayed === null || stat.Game.datePlayed > lastPlayed) {
      lastPlayed = stat.Game.datePlayed;
    }

    const winner = stat.Game.winner;
    if (winner === stat.team) wins += 1;
    else if (winner !== null) losses += 1;

    if (stat.ratingAttack !== null && stat.ratingDefense !== null) {
      ratingSum += (stat.ratingAttack + stat.ratingDefense) / 2;
      ratingCount += 1;
    }
    if (stat.acs !== null) {
      acsSum += stat.acs;
      acsCount += 1;
    }
    if (stat.kast !== null) {
      kastSum += stat.kast;
      kastCount += 1;
    }

    totalKills += stat.kills ?? 0;
    totalDeaths += stat.deaths ?? 0;
    totalAssists += stat.assists ?? 0;
    totalDamage += stat.damage ?? 0;
    totalRounds += stat.Game.rounds;
  }

  const tiersHighestFirst = Array.from(tiers).sort(
    (a, b) => TIER_RANK[b] - TIER_RANK[a],
  );

  return {
    gamesPlayed: stats.length,
    teamIds: Array.from(teamIds),
    tiers: tiersHighestFirst,
    lastPlayed,
    wins,
    losses,
    avgRating: ratingCount === 0 ? 0 : ratingSum / ratingCount,
    avgAcs: acsCount === 0 ? 0 : acsSum / acsCount,
    avgKast: kastCount === 0 ? 0 : kastSum / kastCount,
    kda:
      totalDeaths === 0
        ? totalKills + totalAssists
        : (totalKills + totalAssists) / totalDeaths,
    adr: totalRounds === 0 ? 0 : totalDamage / totalRounds,
  };
}
