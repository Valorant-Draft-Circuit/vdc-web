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
