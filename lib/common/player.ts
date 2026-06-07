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
