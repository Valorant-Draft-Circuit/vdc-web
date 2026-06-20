import { cache } from "react";
import { GameType, MapBanType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TIERS_LIST } from "@/lib/common/constants";
import { formatDate } from "@/lib/common/format";
import { buildMapReport } from "@/lib/common/matchNight/mapReport";
import { buildStandingsMovers, sortMovers } from "@/lib/common/matchNight/movers";
import { buildTopPerformers } from "@/lib/common/matchNight/performers";
import {
  NightStatRow,
  RecapMapEntry,
  RecapMover,
  RecapView,
} from "@/lib/common/matchNight/types";
import { getAllGamesBy } from "../games/games";
import { getAllActiveTeamsIn } from "../teams/teams";
import { rankTeams } from "../standings/standings";

export type MatchNightRecap = {
  overall: RecapView;
  tierViews: RecapView[];
};

const TOP_MOVERS_SHOWN = 5;

const teamNameAndLogoSelect = {
  name: true,
  Franchise: { select: { Brand: { select: { logo: true } } } },
} as const;

type TierNight = {
  view: RecapView;
  playedMaps: RecapMapEntry[];
  bannedMaps: RecapMapEntry[];
  matchCount: number;
  allMovers: RecapMover[];
};

export const getMatchNightRecap = cache(
  async (season: number): Promise<MatchNightRecap | null> => {
    const tierNights = await Promise.all(
      TIERS_LIST.map((tier) => getTierNight(season, tier))
    );

    const playedTierNights = tierNights.filter(
      (night) => night.view.matchDay !== null
    );
    if (playedTierNights.length === 0) {
      return null;
    }

    return {
      overall: buildOverallView(playedTierNights),
      tierViews: tierNights.map((night) => night.view),
    };
  }
);

async function getTierNight(season: number, tier: Tier): Promise<TierNight> {
  const matchDay = await findLatestPlayedMatchDay(season, tier);
  if (matchDay === null) {
    return emptyTierNight(tier);
  }

  const [nightGames, nightBans, seasonGames, teams] = await Promise.all([
    findNightGames(season, tier, matchDay),
    findNightBans(season, tier, matchDay),
    getAllGamesBy(tier, season),
    getAllActiveTeamsIn(tier),
  ]);

  const statRows: NightStatRow[] = nightGames.flatMap((game) =>
    game.PlayerStats.filter(
      (stat) => stat.Player.PrimaryRiotAccount?.riotIGN != null
    ).map(
      (stat) => ({
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
      })
    )
  );

  const gamesBeforeNight = seasonGames.filter(
    (game) => game.Match?.matchDay !== matchDay
  );
  const allMovers =
    gamesBeforeNight.length === 0
      ? []
      : buildStandingsMovers(
          rankTeams(teams, gamesBeforeNight),
          rankTeams(teams, seasonGames),
          tier
        );

  const playedMaps: RecapMapEntry[] = nightGames.map((game) => ({
    map: game.map,
    game: {
      tier,
      gameID: game.gameID,
      ...matchupFieldsOf(game),
    },
  }));
  const bannedMaps: RecapMapEntry[] = nightBans.map((ban) => ({
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
  }));
  const matchCount = new Set(
    nightGames.map((game) => game.Match?.matchID)
  ).size;

  const nightDate = latestScheduledDate(nightGames);

  return {
    view: {
      key: tier,
      matchDay,
      nightDateLabel: nightDate !== null ? formatDate(nightDate) : null,
      performers: buildTopPerformers(statRows),
      mapReport: buildMapReport(playedMaps, bannedMaps, matchCount),
      movers: allMovers.slice(0, TOP_MOVERS_SHOWN),
    },
    playedMaps,
    bannedMaps,
    matchCount,
    allMovers,
  };
}

async function findLatestPlayedMatchDay(
  season: number,
  tier: Tier
): Promise<number | null> {
  const latestMatch = await prisma.matches.findFirst({
    where: {
      season,
      tier,
      matchDay: { not: null },
      Games: { some: { gameType: GameType.SEASON, winner: { not: null } } },
    },
    orderBy: { matchDay: "desc" },
    select: { matchDay: true },
  });
  return latestMatch?.matchDay ?? null;
}

async function findNightGames(season: number, tier: Tier, matchDay: number) {
  return prisma.games.findMany({
    where: {
      season,
      tier,
      gameType: GameType.SEASON,
      winner: { not: null },
      Match: { matchDay },
    },
    select: {
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
    },
  });
}

async function findNightBans(season: number, tier: Tier, matchDay: number) {
  return prisma.mapBans.findMany({
    where: {
      type: MapBanType.BAN,
      Match: { season, tier, matchDay },
    },
    select: {
      map: true,
      matchID: true,
      Match: {
        select: {
          Home: { select: teamNameAndLogoSelect },
          Away: { select: teamNameAndLogoSelect },
        },
      },
    },
  });
}

type NightGame = Awaited<ReturnType<typeof findNightGames>>[number];

function matchupFieldsOf(game: NightGame) {
  return {
    matchID: game.Match?.matchID ?? null,
    homeTeamName: game.Match?.Home?.name ?? null,
    homeTeamLogo: game.Match?.Home?.Franchise.Brand?.logo ?? null,
    awayTeamName: game.Match?.Away?.name ?? null,
    awayTeamLogo: game.Match?.Away?.Franchise.Brand?.logo ?? null,
  };
}

function buildOverallView(playedTierNights: TierNight[]): RecapView {
  const pooledPerformers = playedTierNights.flatMap(
    (night) => night.view.performers
  );
  const pooledPlayedMaps = playedTierNights.flatMap(
    (night) => night.playedMaps
  );
  const pooledBannedMaps = playedTierNights.flatMap(
    (night) => night.bannedMaps
  );
  const pooledMovers = sortMovers(
    playedTierNights.flatMap((night) => night.allMovers)
  );
  const pooledMatchCount = playedTierNights.reduce(
    (total, night) => total + night.matchCount,
    0
  );
  return {
    key: "OVERALL",
    matchDay: null,
    nightDateLabel: null,
    performers: pooledPerformers,
    mapReport: buildMapReport(
      pooledPlayedMaps,
      pooledBannedMaps,
      pooledMatchCount
    ),
    movers: pooledMovers.slice(0, TOP_MOVERS_SHOWN),
  };
}

function emptyTierNight(tier: Tier): TierNight {
  return {
    view: {
      key: tier,
      matchDay: null,
      nightDateLabel: null,
      performers: [],
      mapReport: { mostPlayed: null, mostBanned: null },
      movers: [],
    },
    playedMaps: [],
    bannedMaps: [],
    matchCount: 0,
    allMovers: [],
  };
}

function latestScheduledDate(
  nightGames: Array<{ Match: { dateScheduled: Date } | null }>
): Date | null {
  const times = nightGames
    .map((game) => game.Match?.dateScheduled)
    .filter((date): date is Date => date !== undefined)
    .map((date) => date.getTime());
  return times.length > 0 ? new Date(Math.max(...times)) : null;
}
