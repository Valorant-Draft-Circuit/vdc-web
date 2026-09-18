import { Prisma, Tier } from "@prisma/client";
import {
  NightStatRow,
  RecapMapEntry,
} from "@/lib/common/matchNight/types";

const teamNameAndLogoSelect = {
  name: true,
  Franchise: { select: { Brand: { select: { logo: true } } } },
} satisfies Prisma.TeamsSelect;

export const recapGameSelect = {
  gameID: true,
  map: true,
  Match: {
    select: {
      matchID: true,
      dateScheduled: true,
      Home: { select: teamNameAndLogoSelect },
      Away: { select: teamNameAndLogoSelect },
    },
  },
  PlayerStats: {
    select: {
      userID: true,
      ratingAttack: true,
      ratingDefense: true,
      acs: true,
      kills: true,
      deaths: true,
      Player: {
        select: {
          PrimaryRiotAccount: { select: { riotIGN: true } },
        },
      },
    },
  },
} satisfies Prisma.GamesSelect;

export const recapBanSelect = {
  map: true,
  matchID: true,
  Match: {
    select: {
      Home: { select: teamNameAndLogoSelect },
      Away: { select: teamNameAndLogoSelect },
    },
  },
} satisfies Prisma.MapBansSelect;

export type RecapGame = Prisma.GamesGetPayload<{ select: typeof recapGameSelect }>;
export type RecapBan = Prisma.MapBansGetPayload<{ select: typeof recapBanSelect }>;

export function matchupFieldsOf(game: RecapGame) {
  return {
    matchID: game.Match?.matchID ?? null,
    homeTeamName: game.Match?.Home?.name ?? null,
    homeTeamLogo: game.Match?.Home?.Franchise.Brand?.logo ?? null,
    awayTeamName: game.Match?.Away?.name ?? null,
    awayTeamLogo: game.Match?.Away?.Franchise.Brand?.logo ?? null,
  };
}

export function toStatRows(game: RecapGame, tier: Tier): NightStatRow[] {
  return game.PlayerStats.filter(
    (stat) => stat.Player.PrimaryRiotAccount?.riotIGN != null
  ).map((stat) => ({
    userID: stat.userID,
    playerName: stat.Player.PrimaryRiotAccount?.riotIGN as string,
    tier,
    gameID: game.gameID,
    map: game.map,
    ...matchupFieldsOf(game),
    ratingAttack: stat.ratingAttack,
    ratingDefense: stat.ratingDefense,
    acs: stat.acs,
    kills: stat.kills,
    deaths: stat.deaths,
  }));
}

export function toPlayedMapEntry(game: RecapGame, tier: Tier): RecapMapEntry {
  return {
    map: game.map,
    game: {
      tier,
      gameID: game.gameID,
      ...matchupFieldsOf(game),
    },
  };
}

export function toBannedMapEntry(ban: RecapBan, tier: Tier): RecapMapEntry {
  return {
    map: ban.map,
    game: {
      tier,
      gameID: null,
      matchID: ban.matchID,
      homeTeamName: ban.Match.Home?.name ?? null,
      homeTeamLogo: ban.Match.Home?.Franchise.Brand?.logo ?? null,
      awayTeamName: ban.Match.Away?.name ?? null,
      awayTeamLogo: ban.Match.Away?.Franchise.Brand?.logo ?? null,
    },
  };
}
