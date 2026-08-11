import Link from "next/link";
import TeamMark from "@/components/pickems/common/TeamMark";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import type {
  PlayoffSeries,
  SeriesStatus,
} from "@/lib/queries/home/playoffResults";

const CHIP_BASE =
  "flex-none rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide";

function StatusChip({
  status,
  dateLabel,
}: {
  status: SeriesStatus;
  dateLabel: string;
}) {
  if (status === "complete") {
    return (
      <span
        className={`${CHIP_BASE} bg-black/8 text-vdcGrey dark:bg-white/10 dark:text-gray-400`}
      >
        Final
      </span>
    );
  }
  if (status === "live") {
    return <span className={`${CHIP_BASE} bg-vdcRed/15 text-vdcRed`}>Live</span>;
  }
  return (
    <span className={`${CHIP_BASE} bg-vdcBlue/15 text-vdcBlue`}>{dateLabel}</span>
  );
}

export default function PlayoffSeriesRow({
  series,
  showTierDot,
}: {
  series: PlayoffSeries;
  showTierDot: boolean;
}) {
  const { home, away, homeScore, awayScore, winnerId, status, dateLabel } =
    series;
  const homeWon = winnerId === home.id;
  const awayWon = winnerId === away.id;
  const nameClass = (won: boolean) =>
    `min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wide ${
      won ? "text-vdcGreen" : ""
    }`;

  return (
    <Link
      href={`/match/${series.matchId}`}
      className="flex items-center gap-2 rounded-md border border-black/5 bg-vdcWhite/40 px-2.5 py-2 hover:brightness-95 dark:border-white/10 dark:bg-vdcBlack/30 dark:hover:brightness-110"
    >
      {showTierDot && (
        <span
          className="size-2 flex-none rounded-full"
          style={{ backgroundColor: TIER_HEX_COLOR_MAP[series.tier] }}
        />
      )}
      <TeamMark logo={home.logo} slug={home.slug} name={home.name} size="size-5" />
      <h2 className={nameClass(homeWon)}>{home.slug}</h2>
      <h1 className="flex-none px-1 text-sm font-bold tabular-nums tracking-wider">
        {homeScore}&ndash;{awayScore}
      </h1>
      <h2 className={`${nameClass(awayWon)} text-right`}>{away.slug}</h2>
      <TeamMark logo={away.logo} slug={away.slug} name={away.name} size="size-5" />
      <StatusChip status={status} dateLabel={dateLabel} />
    </Link>
  );
}
