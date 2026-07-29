import { Suspense } from "react";
import { Tier } from "@prisma/client";
import StandingsCard from "./StandingsCard";
import PlayoffOddsInline, {
  PlayoffOddsInlineFallback,
} from "./PlayoffOddsInline";
import { getSeasonCached } from "@/lib/common/cache";
import {
  getApexRankings,
  getFranchiseStandings,
  getStandingsByTier,
} from "@/lib/queries/standings/standings";
import { isTier } from "@/lib/common/tier";
import { getLeagueState } from "@/lib/queries/control/control";
import { PLAYOFF_ODDS_TOOLTIP } from "@/lib/common/playoffOdds";
import InfoTooltip from "@/components/theme/InfoTooltip";

export default async function StandingsPanel({
  query,
}: {
  query: Tier | string;
}) {
  const [currentSeason, leagueState] = await Promise.all([
    getSeasonCached(),
    getLeagueState(),
  ]);
  const tier = query !== "franchises" && isTier(query) ? query : null;
  const showOdds = tier !== null && leagueState === "REGULAR_SEASON";
  let standings;
  let apexRanks;

  if (query === "franchises") {
    standings = await getFranchiseStandings(currentSeason);
    apexRanks = 3;
  } else if (tier) {
    standings = await getStandingsByTier(currentSeason, tier);
    apexRanks = getApexRankings(standings);
  }

  if (standings.length === 0) {
    return (
      <div className="flex flex-col text-2xl text-center min-w-5 m-auto xl:mr-24">
        <div className="flex flex-col gap-3 xl:bg-auto">
          <h1>No standings Found for {query}</h1>
          <h2 className="text-xl">
            (Season <span>{currentSeason}</span> probably hasnt started yet,
            please check back later!)
          </h2>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 bg-vdcRed p-5 rounded-2xl">
      {showOdds && (
        <div className="flex items-center justify-end gap-1.5 px-1">
          <h2 className="text-xs tracking-wider uppercase text-vdcWhite">
            Playoff odds
          </h2>
          <InfoTooltip
            ariaLabel="How playoff odds are calculated"
            text={PLAYOFF_ODDS_TOOLTIP}
            tooltipPosition="right"
            iconClassName="text-vdcWhite/80 hover:text-vdcWhite"
          />
        </div>
      )}
      {standings?.map((standing, index) => (
        <StandingsCard
          key={index}
          standing={standing}
          ranking={index + 1}
          apexRanks={apexRanks}
          query={query}
          oddsSlot={
            showOdds && tier ? (
              <Suspense fallback={<PlayoffOddsInlineFallback />}>
                <PlayoffOddsInline
                  season={currentSeason}
                  tier={tier}
                  franchiseSlug={standing.franchiseSlug}
                />
              </Suspense>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
