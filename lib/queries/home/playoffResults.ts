import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import { correctMatchDate, formatDate } from "@/lib/common/format";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import { getBracketSentiment } from "@/lib/queries/pickems/getBracketSentiment";
import type { BracketTeam } from "@/lib/common/bracket";

export type SeriesTeam = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export type SeriesStatus = "complete" | "live" | "scheduled";

export type PlayoffSeries = {
  matchId: number;
  tier: Tier;
  home: SeriesTeam;
  away: SeriesTeam;
  homeScore: number;
  awayScore: number;
  winnerId: number | null;
  status: SeriesStatus;
  dateLabel: string;
};

export type PlayoffTierResults = {
  tier: Tier;
  latest: PlayoffSeries[];
  upcoming: PlayoffSeries[];
};

export type HighlightSeries = {
  matchId: number | null;
  tier: Tier;
  home: SeriesTeam;
  away: SeriesTeam;
  homeScore: number;
  awayScore: number;
  winnerId: number;
  roundLabel: string;
};

export type UpsetHighlight = {
  series: HighlightSeries;
  crowdTeam: SeriesTeam;
  crowdShare: number;
};

export type ChalkHighlight = {
  series: HighlightSeries;
  crowdShare: number;
};

export type OverallHighlights = {
  biggestUpset: UpsetHighlight | null;
  secondUpset: UpsetHighlight | null;
  chalk: ChalkHighlight | null;
};

export type PlayoffResults = {
  tiers: PlayoffTierResults[];
  overall: {
    latest: PlayoffSeries[];
    upcoming: PlayoffSeries[];
    highlights: OverallHighlights;
  };
};

type ScoredSeries = { series: PlayoffSeries; sortMs: number };
type TierScored = { completed: ScoredSeries[]; pending: ScoredSeries[] };

const RESULTS_PER_COLUMN = 4;
const OVERALL_PER_COLUMN = 5;

function gamesToClinch(matchType: MatchType): number {
  return matchType === MatchType.BO5 ? 3 : 2;
}

async function getTierScored(
  tier: Tier,
  season: number,
): Promise<TierScored | null> {
  const teams = await getTeamsInSeason(tier, season);
  const teamById = new Map<number, SeriesTeam>();
  for (const team of teams) {
    teamById.set(team.id, {
      id: team.id,
      name: team.name,
      slug: team.Franchise.slug,
      logo: team.Franchise.Brand?.logo ?? null,
    });
  }

  const matches = await prisma.matches.findMany({
    where: {
      tier,
      season,
      matchType: { in: [MatchType.BO3, MatchType.BO5] },
    },
    select: {
      matchID: true,
      matchType: true,
      dateScheduled: true,
      home: true,
      away: true,
      Games: { select: { winner: true } },
    },
  });
  if (matches.length === 0) {
    return null;
  }

  const completed: ScoredSeries[] = [];
  const pending: ScoredSeries[] = [];
  for (const match of matches) {
    if (match.home === null || match.away === null) {
      continue;
    }
    const home = teamById.get(match.home);
    const away = teamById.get(match.away);
    if (!home || !away) {
      continue;
    }

    let homeScore = 0;
    let awayScore = 0;
    for (const game of match.Games) {
      if (game.winner === match.home) homeScore++;
      else if (game.winner === match.away) awayScore++;
    }

    const clinch = gamesToClinch(match.matchType);
    const homeWon = homeScore >= clinch;
    const awayWon = awayScore >= clinch;
    const status: SeriesStatus = homeWon || awayWon
      ? "complete"
      : homeScore + awayScore > 0
        ? "live"
        : "scheduled";

    const scored: ScoredSeries = {
      series: {
        matchId: match.matchID,
        tier,
        home,
        away,
        homeScore,
        awayScore,
        winnerId: homeWon ? match.home : awayWon ? match.away : null,
        status,
        dateLabel: formatDate(match.dateScheduled),
      },
      sortMs: correctMatchDate(match.dateScheduled).getTime(),
    };

    if (status === "complete") completed.push(scored);
    else pending.push(scored);
  }

  completed.sort((a, b) => b.sortMs - a.sortMs);
  pending.sort((a, b) => a.sortMs - b.sortMs);
  return { completed, pending };
}

function toSeriesTeam(team: BracketTeam): SeriesTeam {
  return {
    id: team.id,
    name: team.name,
    slug: team.franchiseSlug,
    logo: team.logo,
  };
}

const MIN_HIGHLIGHT_PICKS = 2;

type TierHighlights = { upsets: UpsetHighlight[]; chalk: ChalkHighlight[] };

async function getTierHighlights(
  tier: Tier,
  season: number,
): Promise<TierHighlights> {
  const [bracket, sentiment] = await Promise.all([
    getPlayoffBracket(tier, season),
    getBracketSentiment(tier, season),
  ]);
  const upsets: UpsetHighlight[] = [];
  const chalk: ChalkHighlight[] = [];
  if (!bracket.seeded || !sentiment.available) {
    return { upsets, chalk };
  }

  const totalRounds = bracket.rounds.length;
  const consensusByKey = new Map<
    string,
    { teamId: number; share: number; total: number }
  >();
  for (const slot of sentiment.slots) {
    consensusByKey.set(`${slot.round}:${slot.slot}`, {
      teamId: slot.teamId,
      share: slot.share,
      total: slot.total,
    });
  }

  bracket.rounds.forEach((round, roundIndex) => {
    round.slots.forEach((slot, slotIndex) => {
      if (slot.kind !== "series" || slot.status !== "complete") {
        return;
      }
      const fromFinal = totalRounds - 1 - roundIndex;
      const consensus = consensusByKey.get(`${fromFinal}:${slotIndex}`);
      if (!consensus || consensus.total < MIN_HIGHLIGHT_PICKS) {
        return;
      }
      const winnerSide = slot.home.isWinner ? slot.home : slot.away;
      const series: HighlightSeries = {
        matchId: slot.matchId,
        tier,
        home: toSeriesTeam(slot.home.team),
        away: toSeriesTeam(slot.away.team),
        homeScore: slot.home.score,
        awayScore: slot.away.score,
        winnerId: winnerSide.team.id,
        roundLabel: round.label,
      };

      if (consensus.teamId === winnerSide.team.id) {
        chalk.push({ series, crowdShare: consensus.share });
        return;
      }
      const crowdTeam =
        consensus.teamId === slot.home.team.id
          ? toSeriesTeam(slot.home.team)
          : consensus.teamId === slot.away.team.id
            ? toSeriesTeam(slot.away.team)
            : null;
      if (crowdTeam) {
        upsets.push({ series, crowdTeam, crowdShare: consensus.share });
      }
    });
  });
  return { upsets, chalk };
}

export const getPlayoffResults = cache(
  async (season: number): Promise<PlayoffResults> => {
    const perTier = await Promise.all(
      TIERS_LIST.map(async (tier) => ({
        tier,
        scored: await getTierScored(tier, season),
      })),
    );
    type RankedTier = (typeof TIERS_LIST)[number];
    const present = perTier.filter(
      (entry): entry is { tier: RankedTier; scored: TierScored } =>
        entry.scored !== null,
    );

    const tiers: PlayoffTierResults[] = present.map(({ tier, scored }) => ({
      tier,
      latest: scored.completed
        .slice(0, RESULTS_PER_COLUMN)
        .map((entry) => entry.series),
      upcoming: scored.pending
        .slice(0, RESULTS_PER_COLUMN)
        .map((entry) => entry.series),
    }));

    const allCompleted = present.flatMap(({ scored }) => scored.completed);
    const allPending = present.flatMap(({ scored }) => scored.pending);
    const overallLatest = [...allCompleted]
      .sort((a, b) => b.sortMs - a.sortMs)
      .slice(0, OVERALL_PER_COLUMN)
      .map((entry) => entry.series);
    const overallUpcoming = [...allPending]
      .sort((a, b) => a.sortMs - b.sortMs)
      .slice(0, OVERALL_PER_COLUMN)
      .map((entry) => entry.series);

    const highlightsPerTier = await Promise.all(
      present.map(({ tier }) => getTierHighlights(tier, season)),
    );
    const allUpsets = highlightsPerTier
      .flatMap((entry) => entry.upsets)
      .sort((a, b) => b.crowdShare - a.crowdShare);
    const allChalk = highlightsPerTier
      .flatMap((entry) => entry.chalk)
      .sort((a, b) => b.crowdShare - a.crowdShare);
    const highlights: OverallHighlights = {
      biggestUpset: allUpsets[0] ?? null,
      secondUpset: allUpsets[1] ?? null,
      chalk: allChalk[0] ?? null,
    };

    return {
      tiers,
      overall: {
        latest: overallLatest,
        upcoming: overallUpcoming,
        highlights,
      },
    };
  },
);
