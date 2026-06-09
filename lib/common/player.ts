import { LeagueStatus } from "@prisma/client";

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
