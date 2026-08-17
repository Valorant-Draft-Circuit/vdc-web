import { cache } from "react";
import { Tier } from "@prisma/client";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import { getBracketSentiment } from "@/lib/queries/pickems/getBracketSentiment";
import type { BracketTeam } from "@/lib/common/bracket";

export type SeriesTeam = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export type HighlightSeries = {
  matchId: number | null;
  tier: Tier;
  round: number;
  roundLabel: string;
  home: SeriesTeam;
  away: SeriesTeam;
  homeScore: number;
  awayScore: number;
  winnerId: number;
};

export type UpsetHighlight = {
  series: HighlightSeries;
  crowdTeam: SeriesTeam;
  crowdShare: number;
};

export type OverallHighlights = {
  upsetsByStage: UpsetHighlight[];
};

function toSeriesTeam(team: BracketTeam): SeriesTeam {
  return {
    id: team.id,
    name: team.name,
    slug: team.franchiseSlug,
    logo: team.logo,
  };
}

const MIN_HIGHLIGHT_PICKS = 2;

async function getTierUpsets(
  tier: Tier,
  season: number,
): Promise<UpsetHighlight[]> {
  const [bracket, sentiment] = await Promise.all([
    getPlayoffBracket(tier, season),
    getBracketSentiment(tier, season),
  ]);
  const upsets: UpsetHighlight[] = [];
  if (!bracket.seeded || !sentiment.available) {
    return upsets;
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
      if (consensus.teamId === winnerSide.team.id) {
        return;
      }
      const crowdTeam =
        consensus.teamId === slot.home.team.id
          ? toSeriesTeam(slot.home.team)
          : consensus.teamId === slot.away.team.id
            ? toSeriesTeam(slot.away.team)
            : null;
      if (!crowdTeam) {
        return;
      }
      upsets.push({
        series: {
          matchId: slot.matchId,
          tier,
          round: fromFinal,
          roundLabel: round.label,
          home: toSeriesTeam(slot.home.team),
          away: toSeriesTeam(slot.away.team),
          homeScore: slot.home.score,
          awayScore: slot.away.score,
          winnerId: winnerSide.team.id,
        },
        crowdTeam,
        crowdShare: consensus.share,
      });
    });
  });
  return upsets;
}

export const getPlayoffHighlights = cache(
  async (season: number): Promise<OverallHighlights> => {
    const perTier = await Promise.all(
      TIERS_LIST.map((tier) => getTierUpsets(tier, season)),
    );

    const biggestByStage = new Map<number, UpsetHighlight>();
    for (const upset of perTier.flat()) {
      const current = biggestByStage.get(upset.series.round);
      if (!current || upset.crowdShare > current.crowdShare) {
        biggestByStage.set(upset.series.round, upset);
      }
    }
    const upsetsByStage = [...biggestByStage.values()].sort(
      (a, b) => a.series.round - b.series.round,
    );

    return { upsetsByStage };
  },
);
