import { ProcessedPlayerStat } from "./PlayerSummary";
import PlayerFormSparkline, {
  type SparklinePoint,
} from "./PlayerFormSparkline";

const SPARKLINE_WINDOW = 10;

type Props = {
  stats: ProcessedPlayerStat[];
};

export default function PlayerFormCard({ stats }: Props) {
  const chronological = [...stats].sort(
    (a, b) =>
      new Date(a.Game.datePlayed).getTime() -
      new Date(b.Game.datePlayed).getTime(),
  );

  let wins = 0;
  let losses = 0;
  for (const stat of chronological) {
    if (stat.team === stat.Game.winner) wins += 1;
    else losses += 1;
  }

  const winPct =
    chronological.length === 0
      ? 0
      : Math.round((wins / chronological.length) * 100);

  const streak = computeCurrentStreak(chronological);

  const recentGames = chronological.slice(-SPARKLINE_WINDOW);
  const ratingPoints: SparklinePoint[] = recentGames.map((s) => ({
    value: ((s.ratingAttack ?? 0) + (s.ratingDefense ?? 0)) / 2,
    date: s.Game.datePlayed,
  }));
  const acsPoints: SparklinePoint[] = recentGames.map((s) => ({
    value: s.acs ?? 0,
    date: s.Game.datePlayed,
  }));

  const latestRating =
    ratingPoints[ratingPoints.length - 1]?.value ?? 0;
  const latestAcs = acsPoints[acsPoints.length - 1]?.value ?? 0;

  if (chronological.length === 0) return null;

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm italic">Form</h1>
      </div>
      <div className="px-4 py-3 sm:p-6 flex flex-col gap-3">
        <div className="flex flex-row items-baseline gap-3">
          <h1 className="text-2xl">
            <span className="text-vdcGreen">{wins}</span>
            <span className="text-gray-400"> - </span>
            <span className="text-vdcRed">{losses}</span>
          </h1>
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            {winPct}%{streak ? ` · ${streak.length}${streak.kind} streak` : ""}
          </h2>
        </div>
        <PlayerFormSparkline
          label="RATING"
          color="var(--color-vdcGreen)"
          points={ratingPoints}
          latest={latestRating.toFixed(2)}
          decimals={2}
        />
        <PlayerFormSparkline
          label="ACS"
          color="var(--color-vdcBlue)"
          points={acsPoints}
          latest={Math.round(latestAcs).toString()}
          decimals={0}
        />
      </div>
    </div>
  );
}

function computeCurrentStreak(
  chronological: ProcessedPlayerStat[],
): { kind: "W" | "L"; length: number } | null {
  if (chronological.length === 0) return null;
  const last = chronological[chronological.length - 1];
  const isWin = last.team === last.Game.winner;
  const kind: "W" | "L" = isWin ? "W" : "L";
  let length = 0;
  for (let i = chronological.length - 1; i >= 0; i -= 1) {
    const stat = chronological[i];
    const matches = (stat.team === stat.Game.winner) === isWin;
    if (!matches) break;
    length += 1;
  }
  return { kind, length };
}
