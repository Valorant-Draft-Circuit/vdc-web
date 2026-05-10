import { LeagueStatus, MatchType, Tier } from "@prisma/client";
import { ControlPanel, Flags } from "@/prisma";
import { getMmmrTierLinesCached } from "./cache";

export const isTier = (value: string): value is Tier => {
  return Object.values(Tier).includes(value as Tier);
};

export function toTailwindCustomHexCode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}

export function formatDate(date: Date) {
  // TODO: remove this when we figure out whats going on with date issue
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - 1);

  return newDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function packageMatch(
  match,
  homeWins,
  awayWins,
  formattedDate,
  knockoutType?,
  playoffRound?,
) {
  const homeTeam = match.Home!;
  const awayTeam = match.Away!;
  return {
    id: match.matchID,
    date: formattedDate,
    tier: match.tier,
    homeWins: homeWins,
    awayWins: awayWins,
    matchType: match.matchType,
    knockoutType: knockoutType,
    playoffRound: playoffRound,
    Home: {
      id: homeTeam.id,
      name: homeTeam.name,
      logo: homeTeam.Franchise.Brand?.logo,
      slug: homeTeam.Franchise.slug,
    },
    Away: {
      id: awayTeam.id,
      name: awayTeam.name,
      logo: awayTeam.Franchise.Brand?.logo,
      slug: awayTeam.Franchise.slug,
    },
    Games: match.Games,
  };
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

export const sum = (array) =>
  array.reduce((s, v) => (s += v == null ? 0 : v), 0);
export const avg = (array) =>
  array.reduce((s, v) => (s += v), 0) / array.length;

export function listAllSeasons(currentSeason: number) {
  const seasons: string[] = [];
  for (let i = currentSeason; i >= 6; i--) {
    seasons.push(String(i));
  }
  return seasons;
}

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

export function determineTierWithTierLines(mmr: number | null, tierLines) {
  if (mmr === null) return null;

  const { RECRUIT, PROSPECT, APPRENTICE, EXPERT } = tierLines;
  if (mmr <= RECRUIT.max) return Tier.RECRUIT;
  if (mmr <= PROSPECT.max) return Tier.PROSPECT;
  if (mmr <= APPRENTICE.max) return Tier.APPRENTICE;
  if (mmr <= EXPERT.max) return Tier.EXPERT;
  return Tier.MYTHIC;
}

export async function determineTier(mmr: number | null) {
  if (mmr === null) return null;
  const { RECRUIT, PROSPECT, APPRENTICE, EXPERT } =
    await getMmmrTierLinesCached();
  if (mmr <= RECRUIT.max) return Tier.RECRUIT;
  if (mmr <= PROSPECT.max) return Tier.PROSPECT;
  if (mmr <= APPRENTICE.max) return Tier.APPRENTICE;
  if (mmr <= EXPERT.max) return Tier.EXPERT;
  return Tier.MYTHIC;
}

export async function getMMRTierLines() {
  const mmrTierLines = (await ControlPanel.getMMRCaps("PLAYER")) as {
    RECRUIT: { min: number; max: number };
    PROSPECT: { min: number; max: number };
    APPRENTICE: { min: number; max: number };
    EXPERT: { min: number; max: number };
    MYTHIC: { min: number; max: number };
  };

  return mmrTierLines;
}

export function determineIfKnockout(match) {
  if (match.matchType === MatchType.BO3) {
    return "PLAYOFFS";
  } else if (match.matchType === MatchType.BO5) {
    return "GRAND FINALS";
  } else {
    return "";
  }
}

export function hasFlags(
  flags: string | number,
  checkFlags: (Flags | number | string)[],
  mode: "all" | "any" = "all",
) {
  const value = typeof flags === "string" ? parseInt(flags, 16) : flags;

  const normalized = checkFlags.map((f) =>
    typeof f === "string" ? parseInt(f, 16) : Number(f),
  );

  if (mode === "all") {
    return normalized.every((flag) => (value & flag) !== 0);
  }

  return normalized.some((flag) => (value & flag) !== 0);
}
