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
import {
  BracketTeam,
  Round,
  SeriesSlot,
} from "@/lib/common/bracket";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import {
  recapBanSelect,
  recapGameSelect,
  toBannedMapEntry,
  toPlayedMapEntry,
  toStatRows,
} from "./recapShared";

const PODIUM_SIZE = 4;

export type PlayoffPlacement = {
  tier: Tier;
  rank: number;
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
  placements: PlayoffPlacement[];
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
  placements: PlayoffPlacement[];
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
  const [seasonGames, seasonBans, placements] = await Promise.all([
    findSeasonGames(season, tier),
    findSeasonBans(season, tier),
    findTierPlacements(season, tier),
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
      placements,
    },
    performers,
    playedMaps,
    bannedMaps,
    matchCount,
    placements,
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
  const tierChampions = tierSeasons
    .map((tierSeason) => tierSeason.placements.find((placement) => placement.rank === 1))
    .filter((champion): champion is PlayoffPlacement => champion !== undefined);

  return {
    key: "OVERALL",
    hasData: playedTierSeasons.length > 0,
    performers: pooledPerformers,
    mapReport: buildSeasonMapReport(pooledPlayedMaps, pooledBannedMaps, pooledMatchCount),
    placements: tierChampions,
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

async function findTierPlacements(
  season: number,
  tier: Tier,
): Promise<PlayoffPlacement[]> {
  const bracket = await getPlayoffBracket(tier, season);
  if (!bracket.seeded || bracket.rounds.length === 0) {
    return [];
  }

  const finalRound = bracket.rounds[bracket.rounds.length - 1];
  const finalSeries = completeSeriesIn(finalRound)[0];
  if (!finalSeries) {
    return [];
  }

  const finalResult = seriesResult(finalSeries);
  if (!finalResult) {
    return [];
  }

  const placements: PlayoffPlacement[] = [
    toPlacement(tier, 1, finalResult.winner),
    toPlacement(tier, 2, finalResult.loser),
  ];

  if (bracket.rounds.length >= 2) {
    const semifinalRound = bracket.rounds[bracket.rounds.length - 2];
    const semifinalLosers = completeSeriesIn(semifinalRound)
      .map(seriesResult)
      .filter((result): result is SeriesResult => result !== null)
      .map((result) => result.loser);
    semifinalLosers.forEach((team, index) =>
      placements.push(toPlacement(tier, 3 + index, team)),
    );
  }

  return placements.slice(0, PODIUM_SIZE);
}

function completeSeriesIn(round: Round): SeriesSlot[] {
  return round.slots.filter(
    (slot): slot is SeriesSlot =>
      slot.kind === "series" && slot.status === "complete",
  );
}

type SeriesResult = { winner: BracketTeam; loser: BracketTeam };

function seriesResult(series: SeriesSlot): SeriesResult | null {
  if (series.home.isWinner) {
    return { winner: series.home.team, loser: series.away.team };
  }
  if (series.away.isWinner) {
    return { winner: series.away.team, loser: series.home.team };
  }
  return null;
}

function toPlacement(
  tier: Tier,
  rank: number,
  team: BracketTeam,
): PlayoffPlacement {
  return {
    tier,
    rank,
    teamName: team.name,
    franchiseSlug: team.franchiseSlug,
    teamLogo: team.logo,
    seed: team.seed,
  };
}
