import { BoltIcon } from "@heroicons/react/16/solid";
import TeamMark from "@/components/pickems/common/TeamMark";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import type {
  HighlightSeries,
  OverallHighlights as OverallHighlightsData,
  UpsetHighlight,
} from "@/lib/queries/home/playoffResults";

function pct(share: number): number {
  return Math.round(share * 100);
}

function sides(series: HighlightSeries) {
  const winnerIsHome = series.winnerId === series.home.id;
  return {
    winner: winnerIsHome ? series.home : series.away,
    loser: winnerIsHome ? series.away : series.home,
    winnerScore: winnerIsHome ? series.homeScore : series.awayScore,
    loserScore: winnerIsHome ? series.awayScore : series.homeScore,
  };
}

function StageUpset({ upset }: { upset: UpsetHighlight }) {
  const { series, crowdTeam, crowdShare } = upset;
  const { winner, loser, winnerScore, loserScore } = sides(series);
  return (
    <div className="rounded-lg border border-vdcRed/25 bg-linear-to-r from-vdcRed/8 to-transparent p-3">
      <h1 className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-vdcRed">
        <BoltIcon className="size-3" />
        {series.roundLabel}
        <span style={{ color: TIER_HEX_COLOR_MAP[series.tier] }}>
          {series.tier}
        </span>
      </h1>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <TeamMark
          logo={winner.logo}
          slug={winner.slug}
          name={winner.name}
          size="size-5"
        />
        <h2 className="font-bold uppercase tracking-wide text-vdcGreen">
          {winner.slug}
        </h2>
        <span className="text-xs text-gray-500">def.</span>
        <TeamMark
          logo={loser.logo}
          slug={loser.slug}
          name={loser.name}
          size="size-5"
        />
        <h2 className="font-bold uppercase tracking-wide">{loser.slug}</h2>
        <h2 className="ml-auto font-extrabold tabular-nums tracking-wider">
          {winnerScore} - {loserScore}
        </h2>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <i
          className="block h-full bg-vdcRed"
          style={{ width: `${pct(crowdShare)}%` }}
        />
      </div>
      <h2 className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
        {pct(crowdShare)}% of brackets had {crowdTeam.slug}
      </h2>
    </div>
  );
}

export default function OverallHighlights({
  highlights,
}: {
  highlights: OverallHighlightsData;
}) {
  const { upsetsByStage } = highlights;
  if (upsetsByStage.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Biggest upset by stage
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {upsetsByStage.map((upset) => (
          <StageUpset
            key={`${upset.series.round}-${upset.series.matchId}`}
            upset={upset}
          />
        ))}
      </div>
    </div>
  );
}
