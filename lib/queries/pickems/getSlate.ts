import { cache } from "react";
import { MatchType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { correctMatchDate } from "@/lib/common/format";
import { formatDayShort } from "@/lib/pickems/format";

export type TeamRef = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export type SlateMatch = {
  matchId: number;
  matchType: MatchType;
  dateScheduled: Date;
  home: TeamRef | null;
  away: TeamRef | null;
};

export type Slate = {
  season: number;
  tier: Tier;
  matchDay: number;
  lockTime: Date;
  dateLabel: string;
  matches: SlateMatch[];
};

type SlateTeam = NonNullable<
  Awaited<ReturnType<typeof fetchSlateMatches>>[number]["Home"]
>;

function toTeamRef(team: SlateTeam | null): TeamRef | null {
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

function toSlateMatch(
  match: Awaited<ReturnType<typeof fetchSlateMatches>>[number],
): SlateMatch {
  return {
    matchId: match.matchID,
    matchType: match.matchType,
    dateScheduled: correctMatchDate(match.dateScheduled),
    home: toTeamRef(match.Home),
    away: toTeamRef(match.Away),
  };
}

async function fetchSlateMatches(tier: Tier, season: number, matchDay: number) {
  return prisma.matches.findMany({
    where: {
      tier,
      season,
      matchDay,
      matchType: { in: [MatchType.BO2, MatchType.PRE_SEASON] },
    },
    select: {
      matchID: true,
      matchType: true,
      dateScheduled: true,
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
    },
    orderBy: { dateScheduled: "asc" },
  });
}

export const getSlates = cache(
  async (tier: Tier, season: number): Promise<Slate[]> => {
    const distinctMatchDays = await prisma.matches.findMany({
      where: {
        tier,
        season,
        matchType: { in: [MatchType.BO2, MatchType.PRE_SEASON] },
        matchDay: { not: null },
      },
      select: { matchDay: true },
      distinct: ["matchDay"],
      orderBy: { matchDay: "asc" },
    });
    const matchDays = distinctMatchDays.map((row) => row.matchDay as number);

    const slates: Slate[] = [];
    for (const matchDay of matchDays) {
      const raw = await fetchSlateMatches(tier, season, matchDay);
      if (raw.length === 0) {
        continue;
      }
      const matches = raw.map(toSlateMatch);
      const lockTime = matches[0].dateScheduled;
      slates.push({
        season,
        tier,
        matchDay,
        lockTime,
        dateLabel: formatDayShort(lockTime),
        matches,
      });
    }
    return slates;
  },
);
