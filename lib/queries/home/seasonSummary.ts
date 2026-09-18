import { cache } from "react";
import { GameType, MapBanType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import { buildSeasonMapReport } from "@/lib/common/matchNight/mapReport";
import { buildTopPerformers } from "@/lib/common/matchNight/performers";
import {
  RecapMapEntry,
  RecapMapReport,
  RecapPerformer,
  RecapViewKey,
} from "@/lib/common/matchNight/types";
import { SeriesSlot } from "@/lib/common/bracket";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import {
  recapBanSelect,
  recapGameSelect,
  toBannedMapEntry,
  toPlayedMapEntry,
  toStatRows,
} from "./recapShared";

export type ChampionSummary = {
  tier: Tier;
  teamName: string;
  franchiseSlug: string;
  teamLogo: string | null;
  seed: number;
};

export type SeasonView = {
  key: RecapViewKey;
  hasData: boolean;
  performers: RecapPerformer[];
  mapReport: RecapMapReport;
  champions: ChampionSummary[];
};

export type SeasonSummary = {
  overall: SeasonView;
  tierViews: SeasonView[];
};

type TierSeason = {
  view: SeasonView;
  performers: RecapPerformer[];
  playedMaps: RecapMapEntry[];
  bannedMaps: RecapMapEntry[];
  matchCount: number;
  champion: ChampionSummary | null;
};

export const getSeasonSummary = cache(
  async (season: number): Promise<SeasonSummary | null> => {
    const tierSeasons = await Promise.all(
      TIERS_LIST.map((tier) => getTierSeason(season, tier)),
    );

    const playedTierSeasons = tierSeasons.filter((tierSeason) => tierSeason.view.hasData);
    if (playedTierSeasons.length === 0) {
      return null;
    }

    return {
      overall: buildOverallSeasonView(tierSeasons),
      tierViews: tierSeasons.map((tierSeason) => tierSeason.view),
    };
  },
);

async function getTierSeason(season: number, tier: Tier): Promise<TierSeason> {
  const [seasonGames, seasonBans, champion] = await Promise.all([
    findSeasonGames(season, tier),
    findSeasonBans(season, tier),
    findTierChampion(season, tier),
  ]);

  const statRows = seasonGames.flatMap((game) => toStatRows(game, tier));
  const playedMaps = seasonGames.map((game) => toPlayedMapEntry(game, tier));
  const bannedMaps = seasonBans.map((ban) => toBannedMapEntry(ban, tier));
  const matchCount = new Set(seasonGames.map((game) => game.Match?.matchID)).size;
  const performers = buildTopPerformers(statRows);

  return {
    view: {
      key: tier,
      hasData: seasonGames.length > 0,
      performers,
      mapReport: buildSeasonMapReport(playedMaps, bannedMaps, matchCount),
      champions: champion ? [champion] : [],
    },
    performers,
    playedMaps,
    bannedMaps,
    matchCount,
    champion,
  };
}

function buildOverallSeasonView(tierSeasons: TierSeason[]): SeasonView {
  const playedTierSeasons = tierSeasons.filter((tierSeason) => tierSeason.view.hasData);

  const pooledPerformers = playedTierSeasons.flatMap((tierSeason) => tierSeason.performers);
  const pooledPlayedMaps = playedTierSeasons.flatMap((tierSeason) => tierSeason.playedMaps);
  const pooledBannedMaps = playedTierSeasons.flatMap((tierSeason) => tierSeason.bannedMaps);
  const pooledMatchCount = playedTierSeasons.reduce(
    (total, tierSeason) => total + tierSeason.matchCount,
    0,
  );
  const champions = tierSeasons
    .map((tierSeason) => tierSeason.champion)
    .filter((champion): champion is ChampionSummary => champion !== null);

  return {
    key: "OVERALL",
    hasData: playedTierSeasons.length > 0,
    performers: pooledPerformers,
    mapReport: buildSeasonMapReport(pooledPlayedMaps, pooledBannedMaps, pooledMatchCount),
    champions,
  };
}

async function findSeasonGames(season: number, tier: Tier) {
  return prisma.games.findMany({
    where: {
      season,
      tier,
      gameType: GameType.SEASON,
      winner: { not: null },
    },
    select: recapGameSelect,
  });
}

async function findSeasonBans(season: number, tier: Tier) {
  return prisma.mapBans.findMany({
    where: {
      type: MapBanType.BAN,
      Match: { season, tier },
    },
    select: recapBanSelect,
  });
}

async function findTierChampion(
  season: number,
  tier: Tier,
): Promise<ChampionSummary | null> {
  const bracket = await getPlayoffBracket(tier, season);
  if (!bracket.seeded || bracket.rounds.length === 0) {
    return null;
  }

  const finalRound = bracket.rounds[bracket.rounds.length - 1];
  const finalSeries = finalRound.slots.find(
    (slot): slot is SeriesSlot => slot.kind === "series",
  );
  if (!finalSeries || finalSeries.status !== "complete") {
    return null;
  }

  const winningSide = finalSeries.home.isWinner
    ? finalSeries.home
    : finalSeries.away.isWinner
      ? finalSeries.away
      : null;
  if (!winningSide) {
    return null;
  }

  return {
    tier,
    teamName: winningSide.team.name,
    franchiseSlug: winningSide.team.franchiseSlug,
    teamLogo: winningSide.team.logo,
    seed: winningSide.team.seed,
  };
}
