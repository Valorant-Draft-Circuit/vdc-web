import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { correctMatchDate } from "@/lib/common/format";
import { formatDayShort, slateLockTime } from "@/lib/pickems/format";
import {
  resolveMatch,
  type GameResult,
  type ResolvedMatch,
} from "@/lib/pickems/resolve";
import {
  tallyMatchup,
  findMatchUpsets,
  type MatchupSentiment,
  type MatchUpset,
} from "@/lib/pickems/sentiment";

export type TeamRef = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export type MatchupSentimentView = MatchupSentiment & {
  home: TeamRef | null;
  away: TeamRef | null;
};

export type SentimentSlate = { matchDay: number; dateLabel: string };

export type UpsetView = MatchUpset & {
  home: TeamRef | null;
  away: TeamRef | null;
};

export type MatchSentiment = {
  slates: SentimentSlate[];
  selectedMatchDay: number | null;
  matchups: MatchupSentimentView[];
  upsets: UpsetView[];
};

async function fetchSentimentMatches(tier: Tier, season: number) {
  return prisma.matches.findMany({
    where: {
      season,
      tier,
      matchType: { in: [MatchType.BO2, MatchType.PRE_SEASON] },
      matchDay: { not: null },
    },
    select: {
      matchID: true,
      matchType: true,
      matchDay: true,
      dateScheduled: true,
      home: true,
      away: true,
      Home: {
        select: {
          id: true,
          name: true,
          Franchise: {
            select: { slug: true, Brand: { select: { logo: true } } },
          },
        },
      },
      Away: {
        select: {
          id: true,
          name: true,
          Franchise: {
            select: { slug: true, Brand: { select: { logo: true } } },
          },
        },
      },
      Games: { select: { winner: true, gameType: true } },
      PickemMatchPicks: {
        select: { predictedHomeScore: true, predictedAwayScore: true },
      },
    },
    orderBy: { dateScheduled: "asc" },
  });
}

type SentimentTeam = NonNullable<
  Awaited<ReturnType<typeof fetchSentimentMatches>>[number]["Home"]
>;

function toTeamRef(team: SentimentTeam | null): TeamRef | null {
  if (team === null) {
    return null;
  }
  return {
    id: team.id,
    name: team.name,
    slug: team.Franchise.slug,
    logo: team.Franchise.Brand?.logo ?? null,
  };
}

export const getMatchSentiment = cache(
  async (
    tier: Tier,
    season: number,
    requestedMatchDay: number | null,
    now: Date = new Date(),
  ): Promise<MatchSentiment> => {
    const matches = await fetchSentimentMatches(tier, season);

    const matchesByDay = new Map<number, typeof matches>();
    for (const match of matches) {
      const matchDay = match.matchDay as number;
      if (!matchesByDay.has(matchDay)) {
        matchesByDay.set(matchDay, []);
      }
      matchesByDay.get(matchDay)!.push(match);
    }

    const lockedSlates: SentimentSlate[] = [];
    for (const [matchDay, dayMatches] of matchesByDay) {
      const firstMatchTime = correctMatchDate(dayMatches[0].dateScheduled);
      if (now > slateLockTime(firstMatchTime)) {
        lockedSlates.push({
          matchDay,
          dateLabel: formatDayShort(firstMatchTime),
        });
      }
    }
    lockedSlates.sort((a, b) => a.matchDay - b.matchDay);

    const selectedMatchDay =
      requestedMatchDay !== null &&
      lockedSlates.some((slate) => slate.matchDay === requestedMatchDay)
        ? requestedMatchDay
        : (lockedSlates.at(-1)?.matchDay ?? null);

    const matchups: MatchupSentimentView[] = [];
    const selectedDayMatches =
      selectedMatchDay === null ? [] : (matchesByDay.get(selectedMatchDay) ?? []);
    for (const match of selectedDayMatches) {
      const picks = match.PickemMatchPicks.map((pick) => ({
        home: pick.predictedHomeScore,
        away: pick.predictedAwayScore,
      }));
      matchups.push({
        ...tallyMatchup(match.matchID, picks),
        home: toTeamRef(match.Home),
        away: toTeamRef(match.Away),
      });
    }

    const teamRefsByMatch = new Map<
      number,
      { home: TeamRef | null; away: TeamRef | null }
    >();
    const upsetEntries: {
      sentiment: MatchupSentiment;
      result: ResolvedMatch;
    }[] = [];
    for (const match of matches) {
      const picks = match.PickemMatchPicks.map((pick) => ({
        home: pick.predictedHomeScore,
        away: pick.predictedAwayScore,
      }));
      const sentiment = tallyMatchup(match.matchID, picks);
      const result = resolveMatch(
        match.matchType,
        match.home,
        match.away,
        match.Games as GameResult[],
      );
      teamRefsByMatch.set(match.matchID, {
        home: toTeamRef(match.Home),
        away: toTeamRef(match.Away),
      });
      upsetEntries.push({ sentiment, result });
    }

    const upsets: UpsetView[] = findMatchUpsets(upsetEntries)
      .slice(0, 5)
      .map((upset) => ({
        ...upset,
        home: teamRefsByMatch.get(upset.matchId)?.home ?? null,
        away: teamRefsByMatch.get(upset.matchId)?.away ?? null,
      }));

    return { slates: lockedSlates, selectedMatchDay, matchups, upsets };
  },
);
