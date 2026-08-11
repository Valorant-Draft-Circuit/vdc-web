import type { ReactNode } from "react";
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

function UpsetHero({ upset }: { upset: UpsetHighlight }) {
  const { series, crowdTeam, crowdShare } = upset;
  const { winner, loser, winnerScore, loserScore } = sides(series);
  return (
    <div className="rounded-lg border border-vdcRed/35 bg-linear-to-r from-vdcRed/10 to-transparent p-3.5">
      <h1 className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-vdcRed">
        <BoltIcon className="size-3" />
        Biggest Upset
        <span style={{ color: TIER_HEX_COLOR_MAP[series.tier] }}>
          {series.tier}
        </span>
        <span className="text-gray-400">{series.roundLabel}</span>
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
        <span className="ml-auto font-extrabold tabular-nums tracking-wider">
          {winnerScore}&ndash;{loserScore}
        </span>
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

function MiniHighlight({
  label,
  series,
  caption,
}: {
  label: string;
  series: HighlightSeries;
  caption: string;
}) {
  const { winner, loser, winnerScore, loserScore } = sides(series);
  return (
    <div className="rounded-lg border border-black/5 p-2.5 dark:border-white/10">
      <h1 className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </h1>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
        <TeamMark
          logo={winner.logo}
          slug={winner.slug}
          name={winner.name}
          size="size-4"
        />
        <h2 className="truncate font-bold uppercase tracking-wide text-vdcGreen">
          {winner.slug}
        </h2>
        <span className="text-[10px] text-gray-500">def.</span>
        <h2 className="truncate font-bold uppercase tracking-wide">
          {loser.slug}
        </h2>
        <span className="ml-auto font-bold tabular-nums">
          {winnerScore}&ndash;{loserScore}
        </span>
      </div>
      <h2 className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
        {caption}
      </h2>
    </div>
  );
}

export default function OverallHighlights({
  highlights,
}: {
  highlights: OverallHighlightsData;
}) {
  const { biggestUpset, secondUpset, chalk } = highlights;
  if (!biggestUpset && !secondUpset && !chalk) {
    return null;
  }

  const minis: ReactNode[] = [];
  if (chalk) {
    minis.push(
      <MiniHighlight
        key="chalk"
        label="Chalk held"
        series={chalk.series}
        caption={`${chalk.series.tier} · ${pct(chalk.crowdShare)}% called it`}
      />,
    );
  }
  if (secondUpset) {
    minis.push(
      <MiniHighlight
        key="upset2"
        label="Upset #2"
        series={secondUpset.series}
        caption={`${secondUpset.series.tier} · ${pct(secondUpset.crowdShare)}% backed ${secondUpset.crowdTeam.slug}`}
      />,
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {biggestUpset && <UpsetHero upset={biggestUpset} />}
      {minis.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">{minis}</div>
      )}
    </div>
  );
}
