import { Tier } from "@prisma/client";
import type { MatchOutcome } from "@/lib/pickems/resolve";
import { getMatchSentiment } from "@/lib/queries/pickems/getMatchSentiment";
import SlateSelector from "./SlateSelector";
import MatchSentimentBar from "./MatchSentimentBar";
import AggregateStatCard from "./AggregateStatCard";
import TeamMark from "@/components/pickems/common/TeamMark";

const OUTCOME_LABEL: Record<MatchOutcome, (home: string, away: string) => string> = {
  HOME: (home) => `${home} win`,
  AWAY: (_home, away) => `${away} win`,
  DRAW: () => "a 1-1 draw",
};

export default async function MatchSentimentPanel({
  tier,
  season,
  requestedMatchDay,
}: {
  tier: Tier;
  season: number;
  requestedMatchDay: number | null;
}) {
  const sentiment = await getMatchSentiment(tier, season, requestedMatchDay);

  if (sentiment.slates.length === 0) {
    return (
      <h2 className="rounded-md border border-black/5 bg-vdcWhite/40 p-6 text-center text-sm text-vdcGrey dark:border-white/10 dark:bg-vdcBlack/40 dark:text-gray-400">
        No locked slates yet this season.
      </h2>
    );
  }

  const scoredMatchups = sentiment.matchups.filter((matchup) => matchup.totalPicks > 0);
  const mostContested = [...scoredMatchups].sort((a, b) => a.consensusShare - b.consensusShare)[0] ?? null;
  const biggestConsensus = [...scoredMatchups].sort((a, b) => b.consensusShare - a.consensusShare)[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <SlateSelector
        slates={sentiment.slates}
        selectedMatchDay={sentiment.selectedMatchDay}
        tier={tier}
        season={season}
      />

      <div className="flex flex-col gap-3 rounded-md border border-black/5 bg-vdcWhite/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40">
        {sentiment.matchups.map((matchup) => (
          <div key={matchup.matchId} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm">
              {matchup.home ? (
                <TeamMark
                  logo={matchup.home.logo}
                  slug={matchup.home.slug}
                  name={matchup.home.name}
                  size="size-5"
                />
              ) : null}
              <h2 className="font-bold">{matchup.home?.name ?? "TBD"}</h2>
              <h2 className="text-vdcGrey dark:text-gray-400">vs</h2>
              <h2 className="font-bold">{matchup.away?.name ?? "TBD"}</h2>
              {matchup.away ? (
                <TeamMark
                  logo={matchup.away.logo}
                  slug={matchup.away.slug}
                  name={matchup.away.name}
                  size="size-5"
                />
              ) : null}
              <h2 className="ml-auto text-[11px] text-vdcGrey dark:text-gray-400">
                {matchup.totalPicks} {matchup.totalPicks === 1 ? "pick" : "picks"}
                {matchup.totalPicks > 0 && matchup.totalPicks < 5 ? " (small sample)" : ""}
              </h2>
            </div>
            {matchup.totalPicks > 0 ? (
              <MatchSentimentBar matchup={matchup} />
            ) : (
              <h2 className="text-xs text-vdcGrey dark:text-gray-400">No picks for this match.</h2>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {mostContested ? (
            <AggregateStatCard
              label="Most contested"
              headline={`${mostContested.home?.name ?? "TBD"} vs ${mostContested.away?.name ?? "TBD"}`}
              detail={`consensus only ${Math.round(mostContested.consensusShare * 100)}%`}
            />
          ) : null}
          {biggestConsensus ? (
            <AggregateStatCard
              label="Biggest consensus"
              headline={`${biggestConsensus.home?.name ?? "TBD"} ${biggestConsensus.topScoreline}`}
              detail={`${Math.round(biggestConsensus.consensusShare * 100)}% agree`}
            />
          ) : null}
        </div>

        {sentiment.upsets.length > 0 ? (
          <div className="rounded-md border border-black/5 bg-vdcWhite/40 p-4 dark:border-white/10 dark:bg-vdcBlack/40">
            <h2 className="mb-2 text-md font-bold uppercase tracking-wider text-vdcRed">Biggest upsets</h2>
            <ul className="flex flex-col gap-1.5">
              {sentiment.upsets.map((upset) => {
                const home = upset.home?.name ?? "Home";
                const away = upset.away?.name ?? "Away";
                const crowd = OUTCOME_LABEL[upset.consensus](home, away);
                const actual = OUTCOME_LABEL[upset.actual](home, away);
                return (
                  <li key={upset.matchId} className="text-sm">
                    <h3>
                      Crowd favored {crowd} ({Math.round(upset.consensusShare * 100)}%) but the result was {actual}.
                    </h3>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {sentiment.nailed.length > 0 ? (
          <div className="rounded-md border border-black/5 bg-vdcWhite/40 p-4 dark:border-white/10 dark:bg-vdcBlack/40">
            <h2 className="mb-2 text-md font-bold uppercase tracking-wider text-vdcGreen">Crowd nailed it</h2>
            <ul className="flex flex-col gap-1.5">
              {sentiment.nailed.map((hit) => {
                const home = hit.home?.name ?? "Home";
                const away = hit.away?.name ?? "Away";
                const crowd = OUTCOME_LABEL[hit.consensus](home, away);
                return (
                  <li key={hit.matchId} className="text-sm">
                    <h3>
                      Crowd called {crowd} ({Math.round(hit.consensusShare * 100)}%) and it landed.
                    </h3>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
