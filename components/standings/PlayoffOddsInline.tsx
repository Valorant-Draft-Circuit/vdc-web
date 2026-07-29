import { Tier } from "@prisma/client";
import { getPlayoffOddsCached } from "@/lib/common/cache";
import {
  formatPlayoffOdds,
  playoffOddsColorClass,
} from "@/lib/common/playoffOdds";

export function PlayoffOddsInlineFallback() {
  return (
    <h1 className="flex items-center gap-1.5 text-xs xl:text-sm text-vdcGrey dark:text-gray-300">
      Playoff Odds:
      <span className="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </h1>
  );
}

export default async function PlayoffOddsInline({
  season,
  tier,
  franchiseSlug,
}: {
  season: number;
  tier: Tier;
  franchiseSlug: string;
}) {
  const odds = await getPlayoffOddsCached(season, tier);
  const row = odds?.find((entry) => entry.franchiseSlug === franchiseSlug);
  if (!row) {
    return null;
  }
  return (
    <h1 className={`text-xs xl:text-sm ${playoffOddsColorClass(row.odds)}`}>
      Playoff Odds: {formatPlayoffOdds(row.odds)}
    </h1>
  );
}
