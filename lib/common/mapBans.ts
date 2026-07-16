import { Tier } from "@prisma/client";
import type { MmrTierLines } from "@/lib/common/tier";

export const REGULAR_SEASON_MAPS_PER_MATCH_DAY = 2;

export type MapBanDetails = {
  mapCount: number;
  servedAtFreeze: number;
  frozen: boolean;
  resumedAt: string | null;
};

export function parseMapBanDetails(
  details: string | null,
): MapBanDetails | null {
  if (!details) {
    return null;
  }
  try {
    const parsed = JSON.parse(details);
    if (typeof parsed?.mapCount !== "number") {
      return null;
    }
    return {
      mapCount: parsed.mapCount,
      servedAtFreeze:
        typeof parsed.servedAtFreeze === "number" ? parsed.servedAtFreeze : 0,
      frozen: parsed.frozen === true,
      resumedAt: typeof parsed.resumedAt === "string" ? parsed.resumedAt : null,
    };
  } catch {
    return null;
  }
}

export function mapBanTickingSince(
  details: MapBanDetails,
  rowDate: Date,
): Date {
  return details.resumedAt ? new Date(details.resumedAt) : rowDate;
}

export function remainingMaps(
  details: MapBanDetails,
  liveServed: number,
): number {
  const served = details.servedAtFreeze + (details.frozen ? 0 : liveServed);
  return Math.max(0, details.mapCount - served);
}

export type TierMatchWithGames = {
  season: number;
  matchDay: number | null;
  Games: { datePlayed: Date }[];
};

export function countCompletedMatchDayMaps(
  tierMatches: TierMatchWithGames[],
  since: Date,
): number {
  const matchDays = new Map<string, TierMatchWithGames[]>();
  for (const match of tierMatches) {
    const key = `${match.season}:${match.matchDay}`;
    if (!matchDays.has(key)) {
      matchDays.set(key, []);
    }
    matchDays.get(key)!.push(match);
  }

  let mapsServed = 0;
  for (const dayMatches of matchDays.values()) {
    const everyMatchPlayed = dayMatches.every(
      (match) => match.Games.length > 0,
    );
    if (!everyMatchPlayed) {
      continue;
    }
    const completedAt = Math.max(
      ...dayMatches.flatMap((match) =>
        match.Games.map((game) => game.datePlayed.getTime()),
      ),
    );
    if (completedAt > since.getTime()) {
      mapsServed += REGULAR_SEASON_MAPS_PER_MATCH_DAY;
    }
  }
  return mapsServed;
}

export function placeMmrInTierLines(
  mmrEffective: number | null,
  tierLines: MmrTierLines,
): Tier | null {
  if (mmrEffective === null) {
    return null;
  }
  const tiers = Object.keys(tierLines) as (keyof MmrTierLines)[];
  const matched = tiers.find(
    (tier) =>
      tierLines[tier].min <= mmrEffective &&
      mmrEffective <= tierLines[tier].max,
  );
  return matched ? Tier[matched] : null;
}
