import { Tier } from "@prisma/client";
import StandingsCard from "./StandingsCard";
import { getSeasonCached, getPlayoffOddsCached } from "@/lib/common/cache";
import {
  getApexRankings,
  getFranchiseStandings,
  getStandingsByTier,
  PlayoffOddsRow,
} from "@/lib/queries/standings/standings";
import { isTier } from "@/lib/common/tier";
import { PLAYOFF_ODDS_TOOLTIP } from "@/lib/common/playoffOdds";
import InfoTooltip from "@/components/theme/InfoTooltip";

export default async function StandingsPanel({
  query,
}: {
  query: Tier | string;
}) {
  const currentSeason = await getSeasonCached();
  let standings;
  let apexRanks;
  let playoffOdds: PlayoffOddsRow[] | null = null;

  if (query === "franchises") {
    standings = await getFranchiseStandings(currentSeason);
    apexRanks = 3;
  } else if (isTier(query)) {
    [standings, playoffOdds] = await Promise.all([
      getStandingsByTier(currentSeason, query),
      getPlayoffOddsCached(currentSeason, query),
    ]);
    apexRanks = getApexRankings(standings);
  }

  const oddsBySlug = new Map(
    (playoffOdds ?? []).map((row) => [row.franchiseSlug, row.odds])
  );

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
      {playoffOdds && (
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
          playoffOdds={oddsBySlug.get(standing.franchiseSlug) ?? null}
        />
      ))}
    </div>
  );
}
